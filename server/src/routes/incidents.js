import { Router } from "express";
import { incidentManager } from "../services/incidentManager.js";
import { ConfirmationDenied } from "../services/confirmationGate.js";
import { statusSummary, statusSummaryAsync, closeoutSummary, unresolvedRiskRegister, catchupSummary, askAegisChatAsync } from "../services/summary.js";
import { DEMO_PARTICIPANTS, DEMO_SCRIPT, JUDGES_PITCH_SCRIPT, SCENARIOS } from "../demo/scenario.js";
import { ItemType } from "../services/classifier.js";

const chatRateLimits = new Map();

export function buildIncidentRoutes(io) {
  const router = Router();
  const emitTo = (incidentId, event, payload) => io.to(incidentId).emit(event, payload);

  router.post("/", (req, res) => {
    const { name } = req.body;
    const incident = incidentManager.create(name || "Untitled Incident");
    res.status(201).json(incident.state.toJSON());
  });

  router.get("/", (_req, res) => res.json(incidentManager.list()));

  router.get("/:id", (req, res) => {
    try { res.json(incidentManager.get(req.params.id).state.toJSON()); }
    catch { res.status(404).json({ error: "not found" }); }
  });

  router.post("/:id/participants", (req, res) => {
    const { id: participantId, name, role, roleConfirmed } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const p = state.addParticipant(participantId, name, role, !!roleConfirmed);
    emitTo(req.params.id, "participant", p);
    res.status(201).json(p);
  });

  router.patch("/:id/participants/:pid/role", (req, res) => {
    const { role } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const p = state.correctRole(req.params.pid, role);
    emitTo(req.params.id, "participant", p);
    res.json(p);
  });

  router.post("/:id/utterances", (req, res) => {
    const { speakerId, text } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const item = state.ingest(speakerId, text);
    emitTo(req.params.id, "item", item);
    res.status(201).json(item);
  });

  router.post("/:id/chat", async (req, res, next) => {
    try {
      const { text, speakerId = "user" } = req.body;
      const ip = req.ip || "unknown";
      const lastReq = chatRateLimits.get(ip) || 0;
      if (Date.now() - lastReq < 200) {
        return res.status(429).json({ error: "Rate limit active." });
      }
      chatRateLimits.set(ip, Date.now());

      const incident = incidentManager.get(req.params.id);
      const state = incident.state;
      const userItem = state.ingest(speakerId, text);
      emitTo(req.params.id, "item", userItem);

      const replyText = await askAegisChatAsync(state, text);

      const aiItem = {
        id: `aegis-${Date.now()}`,
        incidentId: req.params.id,
        speakerId: "aegis",
        text: replyText,
        timestamp: new Date(),
        type: "system_event",
        summary: replyText,
        source: "aegis",
      };
      state.items.push(aiItem);
      state.timeline.push(aiItem);
      emitTo(req.params.id, "item", aiItem);
      res.status(201).json({ userItem, aiItem });
    } catch (err) {
      if (err.message?.startsWith("Unknown incident")) return res.status(404).json({ error: err.message });
      next(err);
    }
  });

  router.patch("/:id/items/:itemId/recategorize", (req, res) => {
    const { type } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const item = state.recategorize(req.params.itemId, type);
    emitTo(req.params.id, "item", item);
    res.json(item);
  });

  router.patch("/:id/items/:itemId/owner", (req, res) => {
    const { ownerId } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const item = state.reassignOwner(req.params.itemId, ownerId);
    emitTo(req.params.id, "item", item);
    res.json(item);
  });

  router.patch("/:id/items/:itemId/status", (req, res) => {
    const { status } = req.body;
    const { state } = incidentManager.get(req.params.id);
    const item = state.updateActionStatus(req.params.itemId, status);
    emitTo(req.params.id, "item", item);
    res.json(item);
  });

  router.post("/:id/confirm/:actionId", async (req, res, next) => {
    try {
      const { participantId } = req.body;
      const incident = incidentManager.get(req.params.id);
      const result = await incident.gate.confirm(req.params.actionId, participantId);
      emitTo(req.params.id, "action_confirmed", { actionId: req.params.actionId, result });
      res.json({ confirmed: true, result });
    } catch (e) {
      if (e instanceof ConfirmationDenied) return res.status(403).json({ error: e.message });
      next(e);
    }
  });

  router.post("/:id/decline/:actionId", (req, res) => {
    const { participantId, reason } = req.body;
    const incident = incidentManager.get(req.params.id);
    incident.gate.decline(req.params.actionId, participantId, reason);
    emitTo(req.params.id, "action_declined", { actionId: req.params.actionId });
    res.json({ declined: true });
  });

  router.post("/:id/decay", (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    const stale = state.applyConfidenceDecay();
    stale.forEach((item) => emitTo(req.params.id, "item", item));
    res.json({ staleCount: stale.length });
  });

  router.post("/:id/close", (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    state.close();
    emitTo(req.params.id, "closed", {});
    res.json({
      closeout: closeoutSummary(state),
      riskRegister: unresolvedRiskRegister(state),
    });
  });

  router.get("/:id/closeout", (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    res.json({ closeout: closeoutSummary(state), riskRegister: unresolvedRiskRegister(state) });
  });

  router.get("/:id/summary", async (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    const text = await statusSummaryAsync(state, req.query.role || "unknown");
    res.json({ text, role: req.query.role });
  });

  router.get("/:id/catchup", (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    const text = catchupSummary(state, req.query.role || "unknown");
    res.json({ text, briefing: text, role: req.query.role || "unknown" });
  });

  router.get("/:id/export", (req, res) => {
    const { state } = incidentManager.get(req.params.id);
    const closeout = closeoutSummary(state);
    const risks = unresolvedRiskRegister(state);
    const markdown = `# Aegis Incident Report\n## ${state.name}\n\n${closeout}\n\n${risks}`;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="aegis-${state.id}.md"`);
    res.send(markdown);
  });

  router.post("/:id/integrations/jira", (req, res) => {
    const { actionItemId, requestedBy } = req.body;
    const incident = incidentManager.get(req.params.id);
    const item = incident.state.items.find((i) => i.id === actionItemId);
    if (!item) return res.status(404).json({ error: "Action item not found" });
    const owner = incident.state.participants.get(item.ownerId);
    const ownerName = owner ? owner.name : "Unassigned";
    const action = incident.gate.request(
      `Create Jira ticket: "${item.text}" (owner: ${ownerName})`, "jira", requestedBy || "system"
    );
    emitTo(req.params.id, "critical_action", action);
    res.status(201).json(action);
  });

  router.post("/:id/integrations/statuspage", (req, res) => {
    const { requestedBy } = req.body;
    const incident = incidentManager.get(req.params.id);
    const facts = incident.state.items.filter((i) => i.type === ItemType.FACT);
    const factTexts = facts.slice(-5).map((f) => f.text).join(". ");
    const action = incident.gate.request(
      `Draft Statuspage update: "${factTexts || "Incident under investigation"}"`,
      "statuspage", requestedBy || "system", true
    );
    emitTo(req.params.id, "critical_action", action);
    res.status(201).json(action);
  });

  // ── Scenario-aware demo runner ─────────────────────────────────────────
  router.post("/:id/demo/run", async (req, res) => {
    const { type, scenario: scenarioKey } = req.query;
    const { state } = incidentManager.get(req.params.id);
    res.status(202).json({ started: true });

    for (const p of DEMO_PARTICIPANTS) {
      const participant = state.addParticipant(p.id, p.name, p.role, true);
      emitTo(req.params.id, "participant", participant);
    }

    // Choose script
    let script;
    if (type === "pitch") {
      script = JUDGES_PITCH_SCRIPT;
    } else if (scenarioKey && SCENARIOS[scenarioKey]) {
      script = SCENARIOS[scenarioKey].script;
      // Fire appropriate alert for each scenario
      const alertMessages = {
        payment_gateway: "payment-gateway error_rate alert: 42% (threshold 5%) — PagerDuty SEV-1 firing",
        auth_meltdown:   "auth-service health check CRITICAL: 0% success rate — all users locked out",
        db_failover:     "RDS primary instance db-prod-01 is UNREACHABLE — automated failover initiated",
        cdn_outage:      "CloudFront distribution DEGRADED: 403 errors on 100% of asset requests",
        kafka_crisis:    "Kafka consumer lag CRITICAL: orders topic at 2.4M messages — SLA breach imminent",
      };
      const alertEntry = state.appendSystemEvent("monitoring:pagerduty", alertMessages[scenarioKey] || "SEV-1 alert fired");
      emitTo(req.params.id, "timeline", alertEntry);
    } else {
      script = DEMO_SCRIPT;
      const alertEntry = state.appendSystemEvent("monitoring:datadog", "payment-gateway error_rate alert: 42% (threshold 5%)");
      emitTo(req.params.id, "timeline", alertEntry);
    }

    // Stream lines with variable delay for realism
    for (let i = 0; i < script.length; i++) {
      const line = script[i];
      const delay = 350 + Math.random() * 200;
      await new Promise((r) => setTimeout(r, delay));
      const item = state.ingest(line.speakerId, line.text);
      emitTo(req.params.id, "item", item);

      // Aegis synthetic interjection at key moments
      if (i === 2 || i === 7 || i === Math.floor(script.length * 0.6)) {
        await new Promise((r) => setTimeout(r, 600));
        const summary = await statusSummaryAsync(state, "incident_commander").catch(() => null);
        if (summary) {
          const aegisItem = {
            id: `aegis-interject-${i}`,
            incidentId: req.params.id,
            speakerId: "aegis",
            text: summary,
            timestamp: new Date(),
            type: "system_event",
            summary,
            source: "aegis",
          };
          state.items.push(aegisItem);
          state.timeline.push(aegisItem);
          emitTo(req.params.id, "item", aegisItem);
        }
      }
    }

    // Final resolution message
    await new Promise((r) => setTimeout(r, 800));
    const finalEntry = state.appendSystemEvent("aegis", `Incident "${state.name}" resolved. Generating postmortem report...`);
    emitTo(req.params.id, "timeline", finalEntry);
  });

  // List available scenarios
  router.get("/scenarios/list", (_req, res) => {
    res.json(Object.entries(SCENARIOS).map(([key, s]) => ({
      key,
      name: s.name,
      lines: s.script.length,
    })));
  });

  return router;
}
