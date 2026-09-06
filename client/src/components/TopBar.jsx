import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Bell,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Play,
  Share2,
  X,
  Check,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Plus,
} from "lucide-react";

const SCENARIOS = [
  { key: "payment_gateway", label: "💳 Payment Gateway Latency Outage", sev: 1 },
  { key: "db_saturation", label: "🗄️ Postgres Connection Pool Saturation", sev: 1 },
  { key: "auth_meltdown", label: "🔐 Auth JWT Signing Key Expiration", sev: 2 },
  { key: "cpu_spike", label: "⚡ Worker Cluster CPU Anomaly", sev: 2 },
];

const NOTIFICATIONS = [
  { id: 1, title: "Critical Anomaly Detected", desc: "Payment API latency increased +240%", time: "2m ago", unread: true, sev: "critical" },
  { id: 2, title: "AI Root Cause Identified", desc: "Database connection saturation found with 94% confidence", time: "1m ago", unread: true, sev: "info" },
  { id: 3, title: "Auto-Mitigation Executed", desc: "Connection pool scaled up automatically", time: "Just now", unread: false, sev: "success" },
];

export default function TopBar({
  incident,
  connected = true,
  isSimulating = false,
  onStartSimulation,
  onOpenSearch,
  onRunScenario,
  onOpenAddScenario,
  sidebarCollapsed = false,
  isCallActive = false,
  isMuted = false,
  onStartCall,
  onEndCall,
  onToggleMute,
}) {
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [env, setEnv] = useState("Production (us-east-1)");
  const [envOpen, setEnvOpen] = useState(false);

  const ENV_OPTIONS = ["Production (us-east-1)", "Staging (us-west-2)", "Eu Central (eu-central-1)"];

  return (
    <header
      className={`h-16 px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 border-b border-white/[0.07] ${
        sidebarCollapsed ? "ml-[72px]" : "ml-[240px]"
      }`}
      style={{
        background: "rgba(6, 7, 10, 0.8)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left side: Search & Environment Picker */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl text-xs bg-white/[0.04] border border-white/[0.09] text-zinc-400 hover:text-white hover:border-indigo-500/40 hover:bg-white/[0.06] transition-all w-64 md:w-80 group shadow-inner"
        >
          <Search size={14} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          <span className="flex-1 text-left truncate">Search incidents, services, logs...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.07] text-zinc-400 border border-white/10 group-hover:text-indigo-300">
            ⌘K
          </kbd>
        </button>

        {/* Environment Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setEnvOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.03] border border-white/[0.07] text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Globe size={13} className="text-indigo-400" />
            <span>{env}</span>
            <ChevronDown size={12} className="text-zinc-500" />
          </button>

          <AnimatePresence>
            {envOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 top-full mt-1.5 w-52 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl p-1.5 z-50"
              >
                {ENV_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setEnv(opt);
                      setEnvOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono rounded-lg hover:bg-indigo-600/20 hover:text-indigo-300 text-zinc-300 transition-colors flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    {env === opt && <Check size={13} className="text-indigo-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center / Right status & Actions */}
      <div className="flex items-center gap-3">
        {/* Live System Health Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07]">
          {isSimulating ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Incidents Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              <span>All Systems Operational</span>
            </span>
          )}
        </div>

        {/* Scenario Selector */}
        <div className="relative">
          <button
            onClick={() => setScenarioOpen((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <span>Scenarios</span>
            <ChevronDown size={13} className="text-zinc-500" />
          </button>
          <AnimatePresence>
            {scenarioOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-xl"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Select Incident Scenario
                </div>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      onRunScenario?.(s.key);
                      setScenarioOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs hover:bg-indigo-600/20 text-zinc-200 transition-all flex items-center justify-between group"
                  >
                    <span>{s.label}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        s.sev === 1 ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      SEV-{s.sev}
                    </span>
                  </button>
                ))}

                <div className="border-t border-white/10 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setScenarioOpen(false);
                      onOpenAddScenario?.();
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                  >
                    <Plus size={13} />
                    <span>+ Add Custom Scenario...</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent Global Agora AI Voice Call Status / Controls */}
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={isCallActive ? onEndCall : onStartCall}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
              isCallActive
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.35)] animate-pulse"
                : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25"
            }`}
            title={isCallActive ? "Click to End Agora Voice Call" : "Click to Start Voice Call (Agora AI)"}
          >
            {isCallActive ? (
              <>
                <PhoneOff size={13} className="text-rose-400" />
                <span>LIVE VOICE CALL (END)</span>
              </>
            ) : (
              <>
                <PhoneCall size={13} className="text-cyan-400" />
                <span>START VOICE CALL</span>
              </>
            )}
          </motion.button>

          {isCallActive && (
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-xl border text-xs transition-colors ${
                isMuted
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          )}
        </div>

        {/* Pitch to Judges Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStartSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          title="Launch Live Judge Pitch Demonstration Workflow"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>Pitch to Judges</span>
        </motion.button>

        {/* Prominent SIMULATE INCIDENT Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStartSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
            isSimulating
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-wait animate-pulse"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.6)]"
          }`}
        >
          <Zap size={14} className={isSimulating ? "animate-spin" : "fill-current"} />
          <span>{isSimulating ? "AI Investigating..." : "Simulate Incident"}</span>
        </motion.button>

        {/* Notifications Center Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setUnreadCount(0);
            }}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.07] transition-all relative"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-zinc-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-2xl p-3 z-50 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        n.sev === "critical"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                          : n.sev === "success"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-200"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-mono opacity-60">{n.time}</span>
                      </div>
                      <div className="text-[11px] opacity-80 mt-1">{n.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] cursor-pointer">
          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xs font-bold text-indigo-300">
            VK
          </div>
        </div>
      </div>
    </header>
  );
}
