import React from "react";
import { motion } from "motion/react";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";

export default function AIOrb({
  state = "idle",
  activeServicesCount = 24,
  onClick,
  isCallActive = false,
  audioLevel = 0,
}) {
  const isAnalyzing = state === "analyzing" || state === "thinking" || state === "simulating" || isCallActive;
  const isCritical = state === "critical";

  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-surface-elevated/40 border-b border-white/[0.06] shrink-0 select-none">
      {/* Left: Interactive Aegis Neural Core Emblem */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="relative w-10 h-10 flex items-center justify-center cursor-pointer group shrink-0"
          title={isCallActive ? "Click to End AI Voice Call" : "Click to Start Voice Call"}
        >
          {/* Subtle Outer Radar Ring */}
          <div
            className={`absolute inset-0 rounded-full border transition-all ${
              isCallActive
                ? "border-cyan-400 border-dashed animate-spin"
                : isAnalyzing
                ? "border-indigo-400 border-dashed animate-spin"
                : "border-white/10"
            }`}
          />

          {/* Neural Core Sphere */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isCallActive
                ? "bg-cyan-500 text-white shadow-[0_0_12px_#2DD4F5]"
                : isAnalyzing
                ? "bg-indigo-600 text-white shadow-[0_0_12px_#6366F1]"
                : "bg-surface-interactive text-indigo-400 border border-white/10"
            }`}
          >
            <Sparkles size={14} className={isAnalyzing ? "animate-spin" : ""} />
          </div>
        </motion.div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              AEGIS AI NEURAL CORE
            </span>
            <span
              className={`tag-badge ${
                isCallActive
                  ? "tag-success"
                  : isAnalyzing
                  ? "tag-medium"
                  : "tag-neutral"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? "bg-emerald-400 animate-ping" : "bg-indigo-400"}`} />
              {isCallActive ? "LIVE CALL ACTIVE" : isAnalyzing ? "ANALYZING" : "STANDBY"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            {isCallActive ? "Listening & speaking in real time" : `Monitoring ${activeServicesCount} telemetry streams`}
          </p>
        </div>
      </div>

      {/* Right: Interactive Call Prompt Button */}
      <button
        onClick={onClick}
        className={`btn-solid text-xs h-8 ${
          isCallActive ? "bg-rose-600 hover:bg-rose-500 border-rose-400" : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        <span>{isCallActive ? "End Voice Call" : "Start Voice Call"}</span>
      </button>
    </div>
  );
}
