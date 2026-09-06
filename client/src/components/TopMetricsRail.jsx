import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, CheckCircle2, Clock, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

export default function TopMetricsRail({
  activeIncidents = 12,
  resolvedToday = 34,
  avgResponseTime = "2m 18s",
  aiConfidence = 98.4,
}) {
  const METRICS = [
    {
      id: "active",
      label: "Active Incidents",
      value: activeIncidents,
      change: "-15%",
      isPositive: true,
      icon: ShieldAlert,
      color: "rose",
      sparkline: [8, 14, 11, 15, 12],
    },
    {
      id: "resolved",
      label: "Resolved Today",
      value: resolvedToday,
      change: "+8 today",
      isPositive: true,
      icon: CheckCircle2,
      color: "emerald",
      sparkline: [20, 24, 28, 30, 34],
    },
    {
      id: "response_time",
      label: "Avg Response Time",
      value: avgResponseTime,
      change: "4.2x faster",
      isPositive: true,
      icon: Clock,
      color: "cyan",
      sparkline: [6, 4, 3, 2.5, 2.3],
    },
    {
      id: "confidence",
      label: "AI Confidence",
      value: `${aiConfidence}%`,
      change: "Optimal",
      isPositive: true,
      icon: Sparkles,
      color: "indigo",
      sparkline: [92, 95, 97, 98, 98.4],
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((m) => {
        const Icon = m.icon;

        return (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.02, y: -1 }}
            className="surface-card p-3.5 flex flex-col justify-between border border-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden group"
          >
            {/* Ambient Background Accent */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-zinc-400 font-sans">{m.label}</span>
              <div
                className={`p-1.5 rounded-lg ${
                  m.color === "rose"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : m.color === "emerald"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : m.color === "cyan"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                }`}
              >
                <Icon size={14} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                {m.value}
              </span>

              {/* Sparkline SVG */}
              <svg width="48" height="20" className="overflow-visible opacity-70 group-hover:opacity-100 transition-opacity">
                <polyline
                  fill="none"
                  stroke={
                    m.color === "rose"
                      ? "#F43F5E"
                      : m.color === "emerald"
                      ? "#10B981"
                      : m.color === "cyan"
                      ? "#22D3EE"
                      : "#6366F1"
                  }
                  strokeWidth="2"
                  points={m.sparkline
                    .map((val, idx) => {
                      const x = (idx / (m.sparkline.length - 1)) * 48;
                      const max = Math.max(...m.sparkline);
                      const min = Math.min(...m.sparkline);
                      const y = 18 - ((val - min) / (max - min || 1)) * 14;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              </svg>
            </div>

            <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <TrendingUp size={11} />
                {m.change}
              </span>
              <span>vs 24h avg</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
