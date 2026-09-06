import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  Server,
  Users,
  ShieldCheck,
  Zap,
  FileText,
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function IncidentDetailDrawer({ incident, onClose, onExecuteMitigation }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!incident) return null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "logs", label: "Logs" },
    { id: "analysis", label: "AI Analysis" },
    { id: "root_cause", label: "Root Cause" },
    { id: "actions", label: "Actions" },
    { id: "automation", label: "Automation" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 bg-surface-primary/80 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  {incident.severity}
                </span>
                <span className="text-xs font-mono text-zinc-400">ID: {incident.id}</span>
              </div>
              <h2 className="text-base font-bold text-white font-sans">{incident.title}</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Service: {incident.service} · Impact: {incident.impact}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Animated Tabs */}
          <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-surface-elevated/40 overflow-x-auto scrollbar-none shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-medium font-sans transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="drawerTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                    ✦ Aegis Executive Summary
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    The Payment API service experienced elevated P99 latency exceeding 840ms due to database connection pool saturation. AI agents identified an unoptimized batch query initiated from worker-cluster holding connections open.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-mono">CONFIDENCE SCORE</span>
                    <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                      {incident.confidence}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-mono">DURATION</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {incident.started}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex gap-3 items-start border-l-2 border-indigo-500 pl-4 py-1">
                  <span className="text-zinc-500 text-[10px]">12:42:01</span>
                  <span className="text-zinc-200">Anomaly detected: api-gateway P99 latency spike</span>
                </div>
                <div className="flex gap-3 items-start border-l-2 border-indigo-500 pl-4 py-1">
                  <span className="text-zinc-500 text-[10px]">12:42:05</span>
                  <span className="text-zinc-200">Logs & Metrics sub-agents dispatched</span>
                </div>
                <div className="flex gap-3 items-start border-l-2 border-purple-500 pl-4 py-1">
                  <span className="text-zinc-500 text-[10px]">12:42:15</span>
                  <span className="text-purple-300">Root Cause identified: Connection pool saturation (94% confidence)</span>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="p-3 rounded-xl bg-black font-mono text-[11px] text-zinc-300 space-y-1.5 overflow-x-auto border border-white/10">
                <div className="text-rose-400">[12:42:01] ERROR postgres-cluster: max_connections (200) reached</div>
                <div className="text-amber-400">[12:42:03] WARN api-gateway: connection acquire timeout 5000ms</div>
                <div className="text-zinc-400">[12:42:05] INFO worker-cluster: executing batch_payout_sync()</div>
                <div className="text-rose-400">[12:42:10] ERROR api-gateway: HTTP 504 Gateway Timeout</div>
              </div>
            )}

            {activeTab === "root_cause" && (
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase">Causal Graph Chain</h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-rose-300">
                    1. DATABASE SATURATION (94% confidence)
                  </div>
                  <div className="text-center text-zinc-500">↓</div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-300">
                    2. CONNECTION QUEUE (91% correlation)
                  </div>
                  <div className="text-center text-zinc-500">↓</div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-300">
                    3. API LATENCY (89% correlation)
                  </div>
                </div>
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-3">
                <button
                  onClick={onExecuteMitigation}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  <Zap size={15} />
                  <span>Execute Automated Mitigation (Expand Pool to 400)</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
