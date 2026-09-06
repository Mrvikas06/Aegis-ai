import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Wrench, Zap, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function AutoMitigationModal({ isOpen, onClose, onConfirm }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    "Expanding postgres-cluster pool size to 400 connections...",
    "Restarting bottlenecked poolers on worker-cluster...",
    "Applying rate limiting on non-critical endpoints...",
    "Verifying P99 latency restoration on api-gateway...",
    "Incident Resolved! All services restored to nominal health.",
  ];

  const handleStart = () => {
    setIsExecuting(true);
    let s = 0;
    const interval = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          onConfirm?.();
        }, 1500);
      }
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-lg p-6 rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl space-y-5 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Autonomous Auto-Mitigation Console
                </h3>
                <p className="text-xs text-zinc-400">Target: postgres-cluster & api-gateway</p>
              </div>
            </div>

            {!isExecuting && (
              <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10">
                <X size={18} />
              </button>
            )}
          </div>

          {!isExecuting ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                <span className="font-bold text-emerald-400 font-mono">✦ AEGIS PROPOSED MITIGATION PLAN</span>
                <ul className="list-disc list-inside text-zinc-200 space-y-1 font-mono">
                  <li>Increase database connection pool capacity (200 → 400)</li>
                  <li>Gracefully restart hanging worker API instances</li>
                  <li>Enforce temporary traffic throttling on payout endpoints</li>
                  <li>Verify latency recovery for 5 minutes</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <span>ESTIMATED DOWNTIME: 0s</span>
                <span className="text-emerald-400 font-bold">RECOVERY PROBABILITY: 99.4%</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} />
                  <span>Execute Mitigation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 text-xs font-mono text-white">
                <RefreshCw size={16} className="text-emerald-400 animate-spin" />
                <span>Executing Automated Mitigation Steps...</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {STEPS.map((st, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                      i < step
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                        : i === step
                        ? "bg-indigo-950/30 border-indigo-500/40 text-white animate-pulse"
                        : "bg-white/[0.02] border-white/5 text-zinc-600"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : i === step ? (
                      <RefreshCw size={14} className="text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
