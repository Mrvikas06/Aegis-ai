/**
 * Webhook endpoints for external tool integrations (FR-28, FR-29).
 *
 * G8: POST /monitoring — accepts alerts from Datadog/Grafana/New Relic,
 *     normalizes via MonitoringAdapter, and ingests as system-sourced facts.
 * G9: POST /slack — handles Slack slash commands (/aegis status, /aegis recap)
 *     and responds with the current summary or closeout.
 */
import { Router } from "express";
import { incidentManager } from "../services/incidentManager.js";
import { statusSummary, closeoutSummary } from "../services/summary.js";
import { MonitoringAdapter } from "../services/integrations.js";

export function buildWebhookRoutes(io) {
  const router = Router();
  const monitoring = new MonitoringAdapter();

  /**
   * POST /api/webhooks/monitoring
   * Accepts alert payloads from Datadog, Grafana, New Relic, etc.
   * Expected body: { incidentId, metric?, status?, value?, source? }
   * Falls back to generic normalization if fields are missing.
   */
  router.post("/monitoring", (req, res) => {
    try {
      const { incidentId, ...alertPayload } = req.body;
      if (!incidentId) {
        return res.status(400).json({ error: "incidentId is required" });
      }

      const incident = incidentManager.get(incidentId);
      const normalized = monitoring.normalizeAlert(alertPayload);
      const source = alertPayload.source || "monitoring";

      // Ingest as a system-sourced timeline event (not a participant utterance)
      const entry = incident.state.appendSystemEvent(`monitoring:${source}`, normalized);
      io.to(incidentId).emit("timeline", entry);

      // Also ingest as a fact so it appears in the knowledge feed
      const item = incident.state.ingest("system", normalized);
      io.to(incidentId).emit("item", item);

      res.status(201).json({ entry, item });
    } catch (e) {
      if (e.message.startsWith("Unknown incident")) {
        return res.status(404).json({ error: e.message });
      }
      res.status(400).json({ error: e.message });
    }
  });

  /**
   * POST /api/webhooks/slack
   * Handles Slack slash commands: /aegis status, /aegis recap
   * Slack sends form-encoded data; we parse the `text` field for the subcommand.
   */
  router.post("/slack", (req, res) => {
    try {
      const { text = "", channel_id } = req.body;
      const subcommand = text.trim().toLowerCase();

      // Find the most recent open incident
      const incidents = incidentManager.list().filter((i) => !i.closedAt);
      if (incidents.length === 0) {
        return res.json({ response_type: "ephemeral", text: "No active incidents." });
      }

      const latest = incidents[incidents.length - 1];
      const incident = incidentManager.get(latest.id);

      if (subcommand === "status" || subcommand === "") {
        const summary = statusSummary(incident.state, "unknown");
        return res.json({
          response_type: "in_channel",
          text: `*Aegis Status — ${incident.state.name}*\n${summary}`,
        });
      }

      if (subcommand === "recap" || subcommand === "closeout") {
        const recap = closeoutSummary(incident.state);
        return res.json({
          response_type: "in_channel",
          text: `\`\`\`\n${recap}\n\`\`\``,
        });
      }

      return res.json({
        response_type: "ephemeral",
        text: "Unknown command. Try: `/aegis status` or `/aegis recap`",
      });
    } catch (e) {
      res.json({ response_type: "ephemeral", text: `Error: ${e.message}` });
    }
  });

  return router;
}
