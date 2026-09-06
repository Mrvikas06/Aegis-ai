import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function ResponsePlanModal({ isOpen, onClose, onExecutePlan }) {
  if (!isOpen) return null;

  const STEPS = [
    { num: 1, title: "Increase database connection pool capacity", desc: "Scale max_connections parameter from 200 to 400 on postgres-cluster." },
    { num: 2, title: "Restart unhealthy API instances", desc: "Perform zero-downtime rolling restart of api-gateway worker pods." },
    { num: 3, title: "Apply traffic throttling", desc: "Enforce temporary rate limit on unauthenticated payout sync routes." },
    { num: 4, title: "Monitor latency for five minutes", desc: "Observe P99 latency telemetry to ensure stabilization below 50ms." },
    { num: 5, title: "Verify service recovery", desc: "Verification Agent performs synthetic end-to-end transaction test." },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-lg p-6 rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl space-y-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  AI Generated Response Plan
                </h3>
                <p className="text-xs text-zinc-400">Automated 5-Step Remediation Timeline</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {STEPS.map((st, i) => (
              <motion.div
                key={st.num}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                  {st.num}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">{st.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{st.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 text-xs font-semibold hover:bg-white/5"
            >
              Close
            </button>
            <button
              onClick={onExecutePlan}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-400 text-white font-semibold text-xs shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
            >
              <Zap size={14} />
              <span>Execute Response Plan</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
