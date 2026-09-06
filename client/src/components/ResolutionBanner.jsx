import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Sparkles, Clock, ShieldCheck, X } from "lucide-react";

export default function ResolutionBanner({
  isVisible = false,
  resolutionTime = "2m 18s",
  confidence = 98.4,
  onClose,
}) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="surface-card p-4 border border-emerald-500/40 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative overflow-hidden my-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white font-mono tracking-wide">
                  ✓ INCIDENT RESOLVED
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Autonomous Protection Successful
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                All 24 infrastructure services returned to nominal P99 latency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-[10px] text-zinc-400">RESOLUTION TIME</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <Clock size={13} className="text-emerald-400" />
                <span>{resolutionTime}</span>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] text-zinc-400">AI CONFIDENCE</div>
              <div className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles size={13} />
                <span>{confidence}%</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
