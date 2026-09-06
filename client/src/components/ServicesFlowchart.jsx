import React, { useState } from "react";
import { motion } from "motion/react";
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

export default function ServicesFlowchart({ isSimulating = false, simulationStep = 0, onSelectService }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Dynamic status based on simulation step
  const getStatus = (nodeId) => {
    if (!isSimulating && simulationStep === 0) {
      if (nodeId === "payment-api") return "critical";
      if (nodeId === "postgres-db") return "degraded";
      return "healthy";
    }

    if (isSimulating) {
      if (simulationStep >= 15) return "healthy";
      if (nodeId === "payment-api") return "critical";
      if (nodeId === "postgres-db") return "degraded";
      if (nodeId === "checkout" && simulationStep > 5) return "degraded";
    }

    return "healthy";
  };

  const NODES = [
    {
      id: "web-gateway",
      label: "Web Gateway",
      type: "Gateway",
      latency: "14ms",
      level: 0,
      x: 50, // % position
      y: 15,
    },
    {
      id: "checkout",
      label: "Checkout",
      type: "Service",
      latency: getStatus("checkout") === "degraded" ? "240ms" : "42ms",
      level: 1,
      x: 30,
      y: 42,
    },
    {
      id: "auth-svc",
      label: "Auth Service",
      type: "Service",
      latency: "18ms",
      level: 1,
      x: 70,
      y: 42,
    },
    {
      id: "payment-api",
      label: "Payment API",
      type: "Core API",
      latency: getStatus("payment-api") === "critical" ? "1,850ms" : "38ms",
      level: 2,
      x: 30,
      y: 72,
    },
    {
      id: "postgres-db",
      label: "Postgres DB",
      type: "Database",
      latency: getStatus("postgres-db") === "degraded" ? "420ms" : "12ms",
      level: 2,
      x: 70,
      y: 72,
    },
  ];

  const CONNECTIONS = [
    { from: "web-gateway", to: "checkout", id: "conn-1" },
    { from: "web-gateway", to: "auth-svc", id: "conn-2" },
    { from: "checkout", to: "payment-api", id: "conn-3" },
    { from: "auth-svc", to: "postgres-db", id: "conn-4" },
    { from: "payment-api", to: "postgres-db", id: "conn-5" },
  ];

  return (
    <div className="bg-surface-elevated/40 border border-white/[0.08] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-full min-h-[320px]">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            SERVICES DEPENDENCY FLOWCHART
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Healthy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" /> Critical
          </span>
        </div>
      </div>

      {/* SVG Canvas for Flowchart & Animated Directional Connectors */}
      <div className="relative flex-1 min-h-[220px] w-full flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Render Connection Lines with Animated Flow Particles */}
          {CONNECTIONS.map((conn) => {
            const fromNode = NODES.find((n) => n.id === conn.from);
            const toNode = NODES.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const isCrit = getStatus(fromNode.id) === "critical" || getStatus(toNode.id) === "critical";

            return (
              <g key={conn.id}>
                {/* Background path line */}
                <line
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke={isCrit ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.12)"}
                  strokeWidth="2"
                  strokeDasharray={isCrit ? "4 4" : "none"}
                />

                {/* Animated Pulse Dot along path */}
                <circle r={isCrit ? "3.5" : "2.5"} fill={isCrit ? "#EF4444" : "#38BDF8"}>
                  <animateMotion
                    path={`M ${fromNode.x * 3} ${fromNode.y * 2} L ${toNode.x * 3} ${toNode.y * 2}`}
                    dur={isCrit ? "1.2s" : "2.4s"}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Render Rounded Pill Nodes (Matching User's Reference Layout) */}
        {NODES.map((node) => {
          const status = getStatus(node.id);
          const isSelected = selectedNode === node.id;

          let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
          let dotBg = "bg-emerald-400";
          let nodeBorder = "border-emerald-500/30 bg-surface-elevated/80";
          let statusText = "HEALTHY";

          if (status === "critical") {
            badgeBg = "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
            dotBg = "bg-rose-500 animate-pulse";
            nodeBorder = "border-rose-500/60 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
            statusText = "CRITICAL";
          } else if (status === "degraded") {
            badgeBg = "bg-amber-500/20 text-amber-400 border-amber-500/40";
            dotBg = "bg-amber-400";
            nodeBorder = "border-amber-500/40 bg-amber-950/20";
            statusText = "DEGRADED";
          }

          return (
            <motion.div
              key={node.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedNode(node.id);
                onSelectService?.(node);
              }}
              style={{
                position: "absolute",
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`cursor-pointer group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border ${nodeBorder} transition-all duration-200 backdrop-blur-md z-10`}
            >
              {/* Pulsing Status Dot */}
              <span className={`w-2 h-2 rounded-full ${dotBg} shrink-0`} />

              {/* Service Label */}
              <span className="text-xs font-semibold text-white font-sans whitespace-nowrap">
                {node.label}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeBg}`}
              >
                {statusText}
              </span>

              {/* Latency Indicator */}
              <span className="text-[10px] font-mono text-zinc-400 hidden group-hover:inline-block transition-opacity">
                {node.latency}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info / Selected Node Banner */}
      <div className="border-t border-white/[0.06] pt-2.5 mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <span>Active Flow: 5 Nodes Connected</span>
          {isSimulating && (
            <span className="text-indigo-400 animate-pulse">● Live Telemetry Syncing</span>
          )}
        </div>
        {selectedNode ? (
          <span className="text-indigo-300 font-bold">Selected: {NODES.find(n => n.id === selectedNode)?.label}</span>
        ) : (
          <span className="text-zinc-500">Click node for deep metrics</span>
        )}
      </div>

      {/* Selected Node Telemetry Modal */}
      {selectedNode && (
        <div className="absolute inset-x-4 bottom-12 bg-zinc-950/95 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-xl z-20 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyan-400" />
            <div>
              <div className="font-bold text-white font-sans">
                {NODES.find(n => n.id === selectedNode)?.label} Telemetry
              </div>
              <div className="text-[10px] text-zinc-400">
                P99: {NODES.find(n => n.id === selectedNode)?.latency} | Sub-agent: Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectService?.(NODES.find(n => n.id === selectedNode))}
              className="btn-solid text-[11px] h-7 px-3"
            >
              Analyze Telemetry
            </button>
            <button onClick={() => setSelectedNode(null)} className="text-zinc-400 hover:text-white px-1">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
