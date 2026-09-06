import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileSearch,
  BarChart2,
  GitMerge,
  Target,
  ShieldAlert,
  ClipboardList,
  Wrench,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  X,
  Zap,
  Terminal,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AgentOrchestrationCanvas({
  isSimulating = false,
  simulationStep = 0,
  onNodeClick,
  onResetSimulation,
  onStartSimulation,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("graph"); // "graph" | "logs" | "causal"
  const [customLogs, setCustomLogs] = useState([]);

  // Auto-generate log stream based on simulation step
  useEffect(() => {
    if (simulationStep === 0) {
      setCustomLogs([
        { time: "20:17:00", agent: "Monitor Agent", text: "Telemetry normal across 24 service streams.", status: "ok" },
      ]);
      return;
    }

    const logMap = {
      1: { time: "20:17:02", agent: "Monitor Agent", text: "Anomaly flagged on api-gateway. P99 elevated to 1,850ms.", status: "warn" },
      2: { time: "20:17:04", agent: "Detection Agent", text: "SEV-1 Incident confirmed. 12,480 active user sessions impacted.", status: "critical" },
      3: { time: "20:17:06", agent: "Triage Agent", text: "Dispatched parallel sub-agents: Logs, Metrics, and Topology Graph.", status: "info" },
      4: { time: "20:17:08", agent: "Logs Agent", text: "Parsed 14,820 log lines. 'Connection pool exhausted' errors found.", status: "info" },
      5: { time: "20:17:10", agent: "Metrics Agent", text: "Postgres connection pool saturated (200/200 active connections).", status: "warn" },
      7: { time: "20:17:12", agent: "Root Cause Agent", text: "Causal Inference Confirmed (94% confidence): Unoptimized batch payout query.", status: "critical" },
      9: { time: "20:17:14", agent: "Risk Analysis Agent", text: "Evaluated blast radius. Patching pool capacity to 400 has 0% downtime risk.", status: "ok" },
      11: { time: "20:17:16", agent: "Response Planner", text: "Synthesized 5-step automated remediation plan.", status: "info" },
      13: { time: "20:17:18", agent: "Automation Agent", text: "Applying K8s deployment patch: max_connections=400.", status: "ok" },
      16: { time: "20:17:20", agent: "Verification Agent", text: "INCIDENT RESOLVED: P99 latency restored to 18ms across all 24 services.", status: "success" },
    };

    if (logMap[simulationStep]) {
      setCustomLogs((prev) => [...prev, logMap[simulationStep]]);
    }
  }, [simulationStep]);

  // Modular Intelligence Nodes
  const NODES = [
    {
      id: "monitor",
      name: "Monitor Agent",
      role: "Telemetry Scanner",
      icon: Activity,
      x: 40,
      y: 180,
      status: simulationStep >= 1 ? "completed" : "active",
      confidence: 99.8,
      progress: 100,
      task: simulationStep >= 1 ? "Telemetry nominal" : "Scanning 24 service streams",
      output: "P99 latency nominal across 23 nodes. 1 anomaly flagged.",
      metrics: { latency: "14ms", throughput: "42.8k req/sec", status: "ACTIVE" },
    },
    {
      id: "detect",
      name: "Detection Agent",
      role: "Anomaly Classifier",
      icon: AlertTriangle,
      x: 220,
      y: 180,
      status: simulationStep >= 2 ? (simulationStep >= 18 ? "completed" : "active") : "idle",
      confidence: 98.2,
      progress: simulationStep >= 2 ? 100 : 0,
      task: simulationStep >= 2 ? "SEV-1 Latency Spike +240%" : "Listening for triggers",
      output: "SEV-1 anomaly confirmed on api-gateway (12,480 users impacted).",
      metrics: { severity: "SEV-1", impact: "12.4k users", status: "CONFIRMED" },
    },
    {
      id: "triage",
      name: "Triage Agent",
      role: "Priority & Scope",
      icon: BrainCircuit,
      x: 400,
      y: 180,
      status: simulationStep >= 3 ? (simulationStep >= 18 ? "completed" : "active") : "idle",
      confidence: 96.5,
      progress: simulationStep >= 3 ? 100 : 0,
      task: simulationStep >= 3 ? "Dispatched parallel sub-agents" : "Waiting for anomaly",
      output: "Triaged to SEV-1. Dispatched parallel Logs, Metrics, and Dependency sub-agents.",
      metrics: { subagents: "3 Active", priority: "P0", status: "DISPATCHED" },
    },

    // PARALLEL INVESTIGATION BRANCHES
    {
      id: "logs",
      name: "Logs Agent",
      role: "Log Stream Parser",
      icon: FileSearch,
      x: 600,
      y: 70,
      status: simulationStep >= 4 ? (simulationStep >= 7 ? "completed" : "active") : "idle",
      confidence: 94.0,
      progress: simulationStep >= 5 ? 100 : simulationStep >= 4 ? 65 : 0,
      task: simulationStep >= 4 ? "Parsing 14,820 log events/sec" : "Idle",
      output: "Correlated 4,200 'Connection pool exhausted' log events on postgres-cluster.",
      metrics: { parsedLogs: "14,820/s", errorRate: "42%", status: "MATCHED" },
    },
    {
      id: "metrics",
      name: "Metrics Agent",
      role: "P99 & CPU Telemetry",
      icon: BarChart2,
      x: 600,
      y: 180,
      status: simulationStep >= 4 ? (simulationStep >= 7 ? "completed" : "active") : "idle",
      confidence: 97.4,
      progress: simulationStep >= 5 ? 100 : simulationStep >= 4 ? 75 : 0,
      task: simulationStep >= 4 ? "Correlating P99 metrics" : "Idle",
      output: "Postgres connection pool limit (200/200) saturated during payout sync.",
      metrics: { poolUsage: "200/200", p99: "1,850ms", status: "SATURATED" },
    },
    {
      id: "topology",
      name: "Dependency Agent",
      role: "Graph Mapper",
      icon: GitMerge,
      x: 600,
      y: 290,
      status: simulationStep >= 4 ? (simulationStep >= 7 ? "completed" : "active") : "idle",
      confidence: 95.1,
      progress: simulationStep >= 5 ? 100 : simulationStep >= 4 ? 80 : 0,
      task: simulationStep >= 4 ? "Mapping causal chain" : "Idle",
      output: "api-gateway -> auth-service -> postgres-cluster dependency chain validated.",
      metrics: { depth: "3 Hops", edgeCount: "12 Edges", status: "MAPPED" },
    },

    // CONVERGENCE NODES
    {
      id: "root_cause",
      name: "Root Cause Agent",
      role: "Causal Inference",
      icon: Target,
      x: 800,
      y: 180,
      status: simulationStep >= 7 ? (simulationStep >= 18 ? "completed" : "active") : "idle",
      confidence: 94.2,
      progress: simulationStep >= 8 ? 100 : simulationStep >= 7 ? 85 : 0,
      task: simulationStep >= 7 ? "DB Pool Saturation (94% confidence)" : "Waiting for sub-agents",
      output: "Root Cause: Unoptimized batch query holding connections open, causing API timeouts.",
      metrics: { rootCause: "DB Pool", confidence: "94.2%", status: "IDENTIFIED" },
    },
    {
      id: "risk",
      name: "Risk Analysis Agent",
      role: "Blast Radius Assessor",
      icon: ShieldAlert,
      x: 980,
      y: 180,
      status: simulationStep >= 9 ? (simulationStep >= 18 ? "completed" : "active") : "idle",
      confidence: 98.0,
      progress: simulationStep >= 10 ? 100 : simulationStep >= 9 ? 90 : 0,
      task: simulationStep >= 9 ? "Evaluating scaling risk" : "Waiting for root cause",
      output: "Auto-scaling max_connections to 400 has 0% downtime risk.",
      metrics: { downtimeRisk: "0.00%", blastRadius: "Low", status: "APPROVED" },
    },
    {
      id: "planner",
      name: "Response Planner",
      role: "Remediation Synthesizer",
      icon: ClipboardList,
      x: 1160,
      y: 180,
      status: simulationStep >= 11 ? (simulationStep >= 18 ? "completed" : "active") : "idle",
      confidence: 99.1,
      progress: simulationStep >= 12 ? 100 : simulationStep >= 11 ? 95 : 0,
      task: simulationStep >= 11 ? "5-Step Remediation Timeline" : "Waiting for risk evaluation",
      output: "Remediation Plan: 1. Expand pool size. 2. Restart hanging poolers. 3. Verify P99.",
      metrics: { steps: "5 Steps", autoApprove: "TRUE", status: "READY" },
    },
    {
      id: "automation",
      name: "Automation Agent",
      role: "K8s Patch Executor",
      icon: Wrench,
      x: 1340,
      y: 180,
      status: simulationStep >= 13 ? (simulationStep >= 16 ? "completed" : "active") : "idle",
      confidence: 98.7,
      progress: simulationStep >= 14 ? 100 : simulationStep >= 13 ? 70 : 0,
      task: simulationStep >= 13 ? "Applying config patch to K8s" : "Waiting for plan",
      output: "K8s config patch applied: postgres max_connections=400.",
      metrics: { target: "K8s Cluster", action: "Patch Applied", status: "EXECUTED" },
    },
    {
      id: "verification",
      name: "Verification Agent",
      role: "Post-Fix Verifier",
      icon: CheckCircle,
      x: 1520,
      y: 180,
      status: simulationStep >= 16 ? "completed" : "idle",
      confidence: 99.9,
      progress: simulationStep >= 16 ? 100 : 0,
      task: simulationStep >= 16 ? "P99 latency restored (18ms)" : "Waiting for automation",
      output: "INCIDENT RESOLVED: Telemetry nominal across all 24 services.",
      metrics: { latency: "18ms", health: "100%", status: "RESOLVED" },
    },
  ];

  return (
    <div className="surface-workspace p-4 relative overflow-hidden flex flex-col h-[520px] rounded-xl border border-white/[0.08] bg-surface-elevated/40">
      {/* Canvas Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Live AI Agent Orchestration Canvas
              </h3>
              <span className="badge-tag badge-ai flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Causal Network Active
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Multi-agent reasoning graph evaluating infrastructure telemetry in real time
            </p>
          </div>
        </div>

        {/* View Tabs & Toolbar Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-subtle p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab("graph")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === "graph" ? "bg-indigo-600 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Orchestration Graph
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === "logs" ? "bg-indigo-600 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Agent Event Stream ({customLogs.length})
            </button>
          </div>

          <div className="flex items-center gap-1 bg-surface-primary p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.3))}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={onStartSimulation}
              disabled={isSimulating}
              className="p-1.5 rounded text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-40"
              title="Trigger Simulation"
            >
              <Zap size={13} className={isSimulating ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onResetSimulation}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10"
              title="Reset Simulation"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: GRAPH CANVAS */}
      {activeTab === "graph" && (
        <div className="flex-1 relative overflow-x-auto overflow-y-hidden scrollbar-none py-4">
          <div
            className="relative h-full transition-transform duration-300 origin-top-left"
            style={{ width: "1720px", transform: `scale(${zoomLevel})` }}
          >
            {/* Intelligent Animated SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Monitor -> Detect */}
              <line x1="160" y1="180" x2="220" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              
              {/* Detect -> Triage */}
              <line x1="340" y1="180" x2="400" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 2 ? "anim-path-flow stroke-indigo-400" : ""} />

              {/* Triage -> Parallel Branch (Logs, Metrics, Topology) */}
              <path d="M 520 180 C 560 180, 560 70, 600 70" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 3 ? "anim-path-flow stroke-cyan-400" : ""} />
              <line x1="520" y1="180" x2="600" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 3 ? "anim-path-flow stroke-indigo-400" : ""} />
              <path d="M 520 180 C 560 180, 560 290, 600 290" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 3 ? "anim-path-flow stroke-purple-400" : ""} />

              {/* Convergence: Parallel Branches -> Root Cause */}
              <path d="M 720 70 C 760 70, 760 180, 800 180" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 5 ? "anim-path-flow stroke-cyan-400" : ""} />
              <line x1="720" y1="180" x2="800" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 5 ? "anim-path-flow stroke-indigo-400" : ""} />
              <path d="M 720 290 C 760 290, 760 180, 800 180" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 5 ? "anim-path-flow stroke-purple-400" : ""} />

              {/* Root Cause -> Risk -> Planner -> Automation -> Verification */}
              <line x1="920" y1="180" x2="980" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 8 ? "anim-path-flow stroke-amber-400" : ""} />
              <line x1="1100" y1="180" x2="1160" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 10 ? "anim-path-flow stroke-indigo-400" : ""} />
              <line x1="1280" y1="180" x2="1340" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 12 ? "anim-path-flow stroke-purple-400" : ""} />
              <line x1="1460" y1="180" x2="1520" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className={simulationStep >= 15 ? "anim-path-flow stroke-emerald-400" : ""} />
            </svg>

            {/* Refined Minimal Modular Agent Nodes */}
            {NODES.map((node) => {
              const Icon = node.icon;
              const isCompleted = node.status === "completed";
              const isActive = node.status === "active";

              return (
                <motion.div
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    onNodeClick?.(node);
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`absolute w-36 p-3 rounded-xl cursor-pointer z-10 transition-all ${
                    isCompleted
                      ? "bg-emerald-950/30 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : isActive
                      ? "bg-indigo-950/50 border border-indigo-500/50 shadow-[0_0_20px_rgba(91,92,235,0.35)]"
                      : "bg-surface-subtle border border-white/[0.07] opacity-60 hover:opacity-100 hover:border-white/20"
                  }`}
                  style={{ left: `${node.x}px`, top: `${node.y - 40}px` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isActive
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-white/5 text-zinc-500"
                      }`}
                    >
                      <Icon size={12} className={isActive ? "animate-pulse" : ""} />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 font-semibold">
                      {node.confidence}%
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-white truncate font-sans">
                    {node.name}
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate mb-1.5 font-mono">
                    {node.role}
                  </div>

                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-400"
                          : isActive
                          ? "bg-gradient-to-r from-indigo-500 to-cyan-400"
                          : "bg-zinc-700"
                      }`}
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW TAB 2: AGENT LOG STREAM */}
      {activeTab === "logs" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-zinc-950/80 rounded-lg border border-white/10 font-mono text-xs my-2">
          {customLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 py-1 border-b border-white/5">
              <span className="text-zinc-500 text-[10px]">{log.time}</span>
              <span className="text-indigo-400 font-bold min-w-[130px]">{log.agent}:</span>
              <span
                className={`${
                  log.status === "critical"
                    ? "text-rose-400 font-bold"
                    : log.status === "warn"
                    ? "text-amber-300"
                    : log.status === "success"
                    ? "text-emerald-400 font-bold"
                    : "text-zinc-200"
                }`}
              >
                {log.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Floating Node Detail Popup Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-4 right-4 w-96 p-4 rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl z-50 backdrop-blur-xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <selectedNode.icon size={15} className="text-indigo-400" />
                <span className="font-bold text-white font-sans">{selectedNode.name}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div>
              <span className="text-zinc-500 font-mono text-[10px]">ROLE & FUNCTION:</span>
              <p className="text-zinc-200 font-sans mt-0.5">{selectedNode.role}</p>
            </div>

            <div>
              <span className="text-zinc-500 font-mono text-[10px]">CURRENT REASONING OUTPUT:</span>
              <p className="p-2.5 rounded bg-white/[0.04] border border-white/10 text-[11px] font-mono text-indigo-300 mt-0.5 leading-relaxed">
                {selectedNode.output}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="p-2 rounded bg-surface-subtle border border-white/5">
                <span className="text-zinc-500">CONFIDENCE</span>
                <div className="text-emerald-400 font-bold">{selectedNode.confidence}%</div>
              </div>
              <div className="p-2 rounded bg-surface-subtle border border-white/5">
                <span className="text-zinc-500">STATUS</span>
                <div className="text-indigo-400 font-bold uppercase">{selectedNode.metrics?.status || "ACTIVE"}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
