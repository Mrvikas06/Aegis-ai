import React from "react";
import { motion } from "motion/react";
import { Server, Activity, AlertTriangle, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function ServiceHealthGrid({ onSelectService }) {
  const SERVICES = [
    {
      name: "API Gateway",
      id: "api-gateway",
      status: "DEGRADED",
      latency: "420ms (P99)",
      availability: "99.2%",
      riskPrediction: "HIGH (Elevated latency)",
      color: "rose",
    },
    {
      name: "Postgres Cluster",
      id: "postgres-cluster",
      status: "WARNING",
      latency: "84ms",
      availability: "99.8%",
      riskPrediction: "CRITICAL (Pool saturation)",
      color: "amber",
    },
    {
      name: "Auth Service",
      id: "auth-service",
      status: "HEALTHY",
      latency: "14ms",
      availability: "99.99%",
      riskPrediction: "LOW (Optimal state)",
      color: "emerald",
    },
    {
      name: "Worker Cluster",
      id: "worker-cluster",
      status: "HEALTHY",
      latency: "32ms",
      availability: "99.95%",
      riskPrediction: "LOW",
      color: "emerald",
    },
    {
      name: "Payments Engine",
      id: "payment-gateway",
      status: "DEGRADED",
      latency: "610ms",
      availability: "98.9%",
      riskPrediction: "HIGH",
      color: "rose",
    },
    {
      name: "Notification Queue",
      id: "notification-queue",
      status: "HEALTHY",
      latency: "8ms",
      availability: "100%",
      riskPrediction: "LOW",
      color: "emerald",
    },
  ];

  return (
    <div className="surface-card p-4 border border-white/[0.08] flex flex-col space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            SERVICE HEALTH & PREDICTIVE RISK
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">24 Services Active</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SERVICES.map((s) => {
          const isDegraded = s.status === "DEGRADED";
          const isWarning = s.status === "WARNING";

          return (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.02, y: -1 }}
              onClick={() => onSelectService?.(s)}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                isDegraded
                  ? "bg-rose-950/20 border-rose-500/30"
                  : isWarning
                  ? "bg-amber-950/20 border-amber-500/30"
                  : "bg-surface-elevated/60 border-white/[0.07] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white font-sans">{s.name}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isDegraded
                      ? "bg-rose-500/20 text-rose-300"
                      : isWarning
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="space-y-1 text-[10px] font-mono text-zinc-400 mt-2">
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="text-zinc-200 font-semibold">{s.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-emerald-400 font-semibold">{s.availability}</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-white/[0.05] text-[9px] font-mono text-indigo-300 flex items-center gap-1">
                <Zap size={10} className="text-cyan-400" />
                <span className="truncate">Risk: {s.riskPrediction}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
