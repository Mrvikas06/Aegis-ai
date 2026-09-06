import { Router } from "express";
import { buildRtcToken, buildRtmToken, agoraConfigured, RtcRole } from "../services/agora/tokenService.js";
import { startConvoAIAgent, stopConvoAIAgent, activeAgents } from "../services/agora/convoAIAgent.js";
import { incidentManager } from "../services/incidentManager.js";

// Track which incidents already have agents running
const runningAgents = new Map(); // incidentId → { agentId, startedAt }

export function buildAgoraRoutes(io, ingestionService) {
  const router = Router();

  // ── Status ────────────────────────────────────────────────────────────────
  router.get("/status", (_req, res) => res.json({
    configured:   agoraConfigured(),
    appId:        process.env.AGORA_APP_ID,
    agentId:      process.env.AGORA_PIPELINE_ID,
    activeAgents: Object.fromEntries(runningAgents),
  }));

  // ── Get RTC token for human participant ───────────────────────────────────
  router.post("/token", (req, res) => {
    try {
      const { incidentId, uid, participantId } = req.body;
      if (!incidentId || !uid) return res.status(400).json({ error: "incidentId and uid required" });

      const rtc = buildRtcToken(incidentId, uid, RtcRole.PUBLISHER);
      const rtm = buildRtmToken(String(uid));

      // Register this UID so webhook transcripts map to the right participant
      ingestionService.registerUid(incidentId, uid, participantId || "p1");

      res.json({
        rtc,
        rtm,
        appId:   process.env.AGORA_APP_ID,
        channel: incidentId,
        uid,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Start Agora Conversational AI agent ───────────────────────────────────
  router.post("/start-agent", async (req, res) => {
    try {
      const { incidentId, forceRestart = false } = req.body;
      if (!incidentId) return res.status(400).json({ error: "incidentId required" });

      // Don't double-start unless forced
      if (runningAgents.has(incidentId) && !forceRestart) {
        return res.json({ started: true, mode: "already_running", ...runningAgents.get(incidentId) });
      }

      const incident = incidentManager.get(incidentId);
      const agentUid = 999999; // Fixed UID for the Aegis agent in every room

      // Mint a token for the agent itself
      const rtcResult = buildRtcToken(incidentId, agentUid, RtcRole.PUBLISHER);
      const tokenStr  = rtcResult?.token || "";

      const result = await startConvoAIAgent(
        incidentId,
        incident.state.name,
        tokenStr,
        agentUid,
        { serverBaseUrl: process.env.SERVER_BASE_URL || "http://localhost:4000" },
        incident.state
      );

      if (result.started) {
        runningAgents.set(incidentId, { agentId: result.agentId, startedAt: new Date().toISOString() });
        // Notify dashboard that AI is live
        io.to(incidentId).emit("agent_status", { status: "online", agentId: result.agentId, mode: result.mode });
      } else {
        // Stub mode — dashboard still works, just no real voice AI
        io.to(incidentId).emit("agent_status", { status: "stub", error: result.error, mode: "stub" });
      }

      res.status(201).json(result);
    } catch (err) {
      console.error("[agora] start-agent error:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // ── Stop agent ────────────────────────────────────────────────────────────
  router.post("/stop-agent", async (req, res) => {
    try {
      const { incidentId } = req.body;
      const result = await stopConvoAIAgent(incidentId);
      runningAgents.delete(incidentId);
      io.to(incidentId).emit("agent_status", { status: "offline" });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Agent event webhook (receives transcripts + tool calls from Agora) ────
  router.post("/agent-events", (req, res) => {
    try {
      const event = req.body;
      const { type, channel_name: channelName, uid, text, is_final, tool_name, tool_args } = event;

      console.log(`[agora-webhook] event: ${type} channel: ${channelName}`);

      // Find which incident this channel belongs to
      const incidentId = channelName; // channel = incidentId

      if (type === "user.message" && text && is_final) {
        // Human spoke — classify and store
        const participantId = ingestionService.getParticipantId(incidentId, uid) || "p1";
        try {
          const incident = incidentManager.get(incidentId);
          const item = incident.state.ingest(participantId, text);
          io.to(incidentId).emit("item", item);
          io.to(incidentId).emit("transcript", { uid, participantId, text, role: "user", timestamp: new Date() });
        } catch (e) { /* incident might not exist yet */ }
      }

      if (type === "agent.message" && text && is_final) {
        // Aegis spoke — log it as a system event
        try {
          const incident = incidentManager.get(incidentId);
          const aegisItem = {
            id:        `aegis-${Date.now()}`,
            incidentId,
            speakerId: "aegis",
            text,
            timestamp: new Date(),
            type:      "system_event",
            summary:   text,
            source:    "aegis_voice",
          };
          incident.state.items.push(aegisItem);
          incident.state.timeline.push(aegisItem);
          io.to(incidentId).emit("item", aegisItem);
          io.to(incidentId).emit("transcript", { uid: 999999, participantId: "aegis", text, role: "agent", timestamp: new Date() });
          // Surface as insight in dashboard
          io.to(incidentId).emit("summary", { text, source: "aegis_voice" });
        } catch (e) { /* ok */ }
      }

      if (type === "agent.tool_call") {
        // Aegis wants to execute a tool — send to dashboard for confirmation
        try {
          const incident = incidentManager.get(incidentId);
          const action = incident.gate?.request?.(
            `${tool_name}: ${JSON.stringify(tool_args)}`,
            tool_name,
            "aegis"
          );
          if (action) io.to(incidentId).emit("critical_action", action);
        } catch (e) { /* ok */ }
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[agora-webhook] error:", err.message);
      res.status(200).json({ ok: true }); // Always 200 to Agora
    }
  });

  // ── Legacy STT webhook (keep for backwards compat) ───────────────────────
  router.post("/stt-webhook", (req, res) => {
    try {
      const item = ingestionService.handleTranscript?.(req.body);
      if (item) io.to(req.body.incidentId || req.body.channel_name).emit("item", item);
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(200).json({ ok: true });
    }
  });

  return router;
}
