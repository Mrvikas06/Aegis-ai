import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Target, ArrowDown, Database, Cpu, Activity, AlertTriangle, Sparkles } from "lucide-react";

export default function RootCauseVisualizationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const CAUSAL_CHAIN = [
    {
      title: "DATABASE SATURATION",
      icon: Database,
      stat: "94% confidence",
      color: "rose",
      desc: "Max connections (200) reached due to unoptimized payout batch query.",
    },
    {
      title: "CONNECTION QUEUE",
      icon: Cpu,
      stat: "91% correlation",
      color: "amber",
      desc: "Incoming requests queued waiting for database connection slots.",
    },
    {
      title: "API LATENCY",
      icon: Activity,
      stat: "89% correlation",
      color: "cyan",
      desc: "P99 latency spiked +240% (842ms) on api-gateway.",
    },
    {
      title: "PAYMENT FAILURES",
      icon: AlertTriangle,
      stat: "76% impact",
      color: "indigo",
      desc: "HTTP 504 gateway timeouts experienced by checkout users.",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-xl p-6 rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl space-y-5 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    AI Root Cause Causal Graph
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                    94% Confidence
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Automated Causal Inference Chain</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          {/* Causal Chain Nodes */}
          <div className="space-y-3 relative py-2">
            {CAUSAL_CHAIN.map((node, idx) => {
              const Icon = node.icon;

              return (
                <React.Fragment key={idx}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      node.color === "rose"
                        ? "bg-rose-950/30 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        : node.color === "amber"
                        ? "bg-amber-950/20 border-amber-500/30"
                        : node.color === "cyan"
                        ? "bg-cyan-950/20 border-cyan-500/30"
                        : "bg-indigo-950/20 border-indigo-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/10 text-white">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono tracking-wide">
                          {node.title}
                        </div>
                        <div className="text-[11px] text-zinc-300 mt-0.5">{node.desc}</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2 py-1 rounded bg-white/10 text-white shrink-0">
                      {node.stat}
                    </span>
                  </motion.div>

                  {idx < CAUSAL_CHAIN.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-indigo-400"
                      >
                        <ArrowDown size={16} />
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">✦ Causal Graph Engine v2.6</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition-colors"
            >
              Done Reviewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
