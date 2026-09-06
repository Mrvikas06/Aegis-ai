# Aegis — Autonomous AI Incident Commander

> **Sub-Second Real-Time Voice & Multi-Agent Triage Copilot for Engineering Outages**

Aegis is an autonomous AI Incident Commander designed to reduce **Mean Time To Resolution (MTTR)** during critical engineering outages. By integrating **Agora WebRTC Conversational AI**, **Groq LPU LLM Acceleration**, and **Multi-Agent Telemetry Orchestration**, Aegis converts complex incident triage into an automated, voice-guided command workflow.

---

## Technical Performance Highlights

- **Sub-600ms Diagnostic Latency**: Groq `openai/gpt-oss-20b` engine processes diagnostic queries in ~560ms.
- **Hands-Free Voice AI Channel**: Talk directly to Aegis over WebRTC using Agora Conversational AI v2, featuring persistent audio streams across dashboard navigation.
- **Parallel Sub-Agent Dispatches**: Autonomous Logs, Metrics, and Topology sub-agents aggregate APM telemetry to pinpoint root causes with up to **98.4% confidence**.
- **Human-in-the-Loop Confirmation Gate**: High-risk actions (Kubernetes auto-scaling, PagerDuty pages, Jira creation, Statuspage publishing) require explicit verbal or one-click IC authorization.

---

## System Architecture & Data Flow

```
                                  HUMAN INCIDENT COMMANDER (IC)
                                                │
                                  ┌─────────────┴─────────────┐
                                  │   Voice (Agora RTC) / Chat│
                                  ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AEGIS COMMAND DASHBOARD                                 │
│                   React 18 + TailwindCSS + Motion + Agora RTC React SDK                 │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               │ WebRTC Audio / REST Agent API                           │ Socket.io & REST
               ▼                                                         ▼
┌──────────────────────────────┐                         ┌──────────────────────────────┐
│  AGORA CONVERSATIONAL AI v2  │                         │     AEGIS EXPRESS SERVER     │
│ Deepgram STT ➔ MiniMax TTS   │                         │ Node.js ➔ IncidentState Engine│
└──────────────┬───────────────┘                         └──────────────┬───────────────┘
               │                                                        │
               │ HTTP Event Webhook                                     │ Low-Latency Completion
               └────────────────────────────┐                           │
                                            ▼                           ▼
                             ┌──────────────────────────┐  ┌────────────────────────────┐
                             │ AGORA WEBHOOK CONTROLLER │  │   GROQ LPU LLM INFERENCE   │
                             │ Transcript & Tool Events │  │    `openai/gpt-oss-20b`    │
                             └──────────────┬───────────┘  └──────────────┬────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────┐
                             │    CONFIRMATION GATE     │
                             │ (K8s, PagerDuty, Jira)   │
                             └──────────────────────────┘
```

---

## Core System Architecture

### 1. Hands-Free Voice Command (`Agora Conversational AI v2`)
- **Direct RTC Channel**: Aegis joins the incident WebRTC channel as an active audio publisher and subscriber.
- **Turn Detection Tuning**: Configured with `max_wait_ms: 2000`, `silence_duration_ms: 400`, and `interrupt_duration_ms: 160` to support natural speech interrupts.
- **Global State Elevation**: WebRTC audio tracks remain active at the root layout level (`App.jsx`), allowing engineers to switch between dashboard tabs while retaining continuous voice communication.

### 2. Low-Latency Diagnostic Engine (`Groq LPU Acceleration`)
- Operates on Groq's dedicated LPU hardware (`openai/gpt-oss-20b` / `llama-3.1-8b-instant`).
- Context payloads are trimmed to 4 core key-value fields (`Incident`, `Fact`, `Cause`, `Fix`), eliminating prompt processing overhead.
- Features `max_tokens: 150`, warm `Connection: keep-alive` sockets, and an `AbortController` 800ms protection guard.

### 3. Multi-Agent Telemetry & Triage Engine
- Ingests telemetry logs, APM metrics, and support ticket spikes.
- Dispatches parallel sub-agents (**Logs Agent**, **Metrics Agent**, **Topology Agent**) to correlate failure cascades and calculate root-cause hypotheses with confidence metrics.

### 4. Human-in-the-Loop Safety Gate
- Prevents unverified automated actions. Operations requiring authorization:
  - **Kubernetes API**: Scaling deployment replicas or rolling back containers.
  - **PagerDuty**: Escalating pages to secondary on-call engineers.
  - **Jira Software**: Generating post-incident tracking tickets.
  - **Statuspage**: Publishing customer-facing status updates.

---

## Repository Structure

```
aegis-final-complete/
├── client/                      # React + Vite Frontend Application
│   ├── public/                  # Static assets & Aegis SVG Favicon
│   ├── src/
│   │   ├── components/          # UI & Voice Components
│   │   │   ├── AegisLogo.jsx    # High-tech vector SVG emblem
│   │   │   ├── AIChatWorkspace.jsx # Voice AI Core & Flowchart Workspace
│   │   │   ├── BootSequence.jsx # Startup boot sequence
│   │   │   ├── SideNav.jsx      # Navigation sidebar with collapsed mode
│   │   │   └── TopBar.jsx       # Global header, search, & voice controls
│   │   ├── views/               # 11 Dedicated Command Dashboards
│   │   │   ├── OverviewView.jsx # Main KPIs & Live Service Topology
│   │   │   ├── IncidentsView.jsx# Live Incidents Queue & Filters
│   │   │   ├── ServicesView.jsx # Service Health & Latency Grid
│   │   │   └── ...              # Orchestration, Investigations, Timeline, etc.
│   │   ├── lib/                 # Socket.io client & API helper libraries
│   │   └── App.jsx              # Root Layout, Global State & WebRTC Provider
├── server/                      # Node.js + Express Backend Engine
│   ├── src/
│   │   ├── services/
│   │   │   ├── agora/           # Agora ConvoAI Agent JOIN REST & Token Services
│   │   │   ├── incidentState.js # In-memory reactive state manager with decay
│   │   │   ├── summary.js       # Groq LLM integration & fast fallback
│   │   │   └── confirmationGate.js # Safety gate for critical action execution
│   │   ├── routes/              # Express API endpoints for Agora & Incidents
│   │   └── index.js             # HTTP & Socket.io server bootstrap
└── README.md                    # Project Documentation
```

---

## Environment & Setup Guide

### 1. Environment Variables (`server/.env`)

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5174
SERVER_BASE_URL=http://localhost:4000

# Agora Conversational AI Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
AGORA_PIPELINE_ID=your_agora_pipeline_id_here

# Groq LLM Engine Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

### 2. Deployment Guides (Render & Vercel)

#### Option A: Deploy on Render (Recommended for WebSockets + Full-Stack Node)
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **New + ➔ Blueprints**.
2. Connect your GitHub repository: `https://github.com/Mrvikas06/Aegis-ai.git`.
3. Render auto-detects [render.yaml](file:///c:/Users/vikas/Documents/try/aegis-final-complete/render.yaml) and builds the application Docker container automatically.
4. Add Environment Variable `GROQ_API_KEY` under Environment settings.

#### Option B: Deploy on Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new) and import `Mrvikas06/Aegis-ai`.
2. Vercel auto-detects [vercel.json](file:///c:/Users/vikas/Documents/try/aegis-final-complete/vercel.json).
3. Click **Deploy**.

### 3. Local Execution Commands

#### Backend Server
```bash
cd server
npm install
npm start
# Express server listening on http://localhost:4000
```

#### Frontend Client
```bash
cd client
npm install
npm run dev
# Vite dev server running on http://localhost:5174
```

---

## Demonstration Walkthrough

1. **Launch Dashboard**: Open `http://localhost:5174` in a modern WebRTC-enabled browser.
2. **Initialize Voice AI**: Click **Start Voice Call (Agora AI)** in the navigation bar or workspace header.
3. **Voice Inquiry**: Speak *"What is broken right now?"* to hear Aegis diagnose the pre-seeded **Payment Gateway Outage** (Postgres DB connection pool saturation at 100/100 connections due to an unoptimized N+1 query).
4. **Lifecycle Simulation**: Click **Simulate New Incident** to trigger end-to-end multi-agent triage, root-cause identification, and automated mitigation workflows.
5. **Inject Custom Scenario**: Select the **Scenarios** dropdown in the navigation header and click **+ Add Custom Scenario...** to create and inject custom outage scenarios in real-time.
