import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { connectMongo } from "./services/persistence.js";
import { buildIncidentRoutes } from "./routes/incidents.js";
import { buildAgoraRoutes } from "./routes/agora.js";
import { buildWebhookRoutes } from "./routes/webhooks.js";
import { attachSockets } from "./sockets/index.js";
import { incidentManager } from "./services/incidentManager.js";
import { AgoraIngestionService } from "./services/agora/ingestionService.js";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Slack slash commands (form-encoded)

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN } });
attachSockets(io);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "aegis-server" }));
app.use("/api/incidents", buildIncidentRoutes(io));
app.use("/api/agora", buildAgoraRoutes(io, new AgoraIngestionService(incidentManager)));
app.use("/api/webhooks", buildWebhookRoutes(io));

import { askAegisChatAsync } from "./services/summary.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientDistPath)) {
  console.log(`[aegis-server] Serving static client assets from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const standaloneRateLimits = new Map();

app.post("/api/chat", async (req, res, next) => {
  try {
    const { text } = req.body;
    const ip = req.ip || "unknown";
    
    // Rate Limiter: 1 request every 5 seconds per IP
    const lastReq = standaloneRateLimits.get(ip) || 0;
    if (Date.now() - lastReq < 5000) {
      return res.status(429).json({ error: "Rate limit active. Please wait 5s." });
    }
    standaloneRateLimits.set(ip, Date.now());

    // Fake state for standalone chat
    const fakeState = { name: "General Inquiry", items: [] };
    const replyText = await askAegisChatAsync(fakeState, text);
    
    res.json({ reply: replyText });
  } catch (err) {
    next(err);
  }
});

// Global error handler to prevent server crashes
app.use((err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.url} -`, err.message);
  if (err.message?.startsWith("Unknown incident")) {
    return res.status(404).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

async function main() {
  await connectMongo(process.env.MONGO_URI);
  incidentManager.attachIO(io);
  httpServer.listen(PORT, () => {
    console.log(`[aegis-server] listening on :${PORT} (client origin: ${CLIENT_ORIGIN})`);
  });
}

main();
