import "dotenv/config";
import express from "express";
import cors from "cors";

import { buildIncidentRoutes } from "./routes/incidents.js";
import { buildAgoraRoutes } from "./routes/agora.js";
import { buildWebhookRoutes } from "./routes/webhooks.js";
import { incidentManager } from "./services/incidentManager.js";
import { AgoraIngestionService } from "./services/agora/ingestionService.js";
import { askAegisChatAsync } from "./services/summary.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Socket.io for serverless environment if io is not passed
const mockIo = {
  to: () => ({ emit: () => {} }),
  emit: () => {},
};

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "aegis-server", provider: "vercel" }));
app.use("/api/incidents", buildIncidentRoutes(mockIo));
app.use("/api/agora", buildAgoraRoutes(mockIo, new AgoraIngestionService(incidentManager)));
app.use("/api/webhooks", buildWebhookRoutes(mockIo));

const standaloneRateLimits = new Map();

app.post("/api/chat", async (req, res, next) => {
  try {
    const { text } = req.body;
    const ip = req.ip || "unknown";
    
    const lastReq = standaloneRateLimits.get(ip) || 0;
    if (Date.now() - lastReq < 3000) {
      return res.status(429).json({ error: "Rate limit active. Please wait 3s." });
    }
    standaloneRateLimits.set(ip, Date.now());

    const fakeState = { name: "General Inquiry", items: [] };
    const replyText = await askAegisChatAsync(fakeState, text);
    
    res.json({ reply: replyText });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.url} -`, err.message);
  if (err.message?.startsWith("Unknown incident")) {
    return res.status(404).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

export default app;
