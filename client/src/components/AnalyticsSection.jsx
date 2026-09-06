import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Sparkles, TrendingUp, Filter } from "lucide-react";

export default function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState("24H");

  const ACTIVITY_DATA = [
    { time: "00:00", incidents: 2, responseTime: 3.2 },
    { time: "04:00", incidents: 1, responseTime: 2.1 },
    { time: "08:00", incidents: 5, responseTime: 4.5 },
    { time: "12:00", incidents: 12, responseTime: 2.3 },
    { time: "16:00", incidents: 8, responseTime: 2.1 },
    { time: "20:00", incidents: 4, responseTime: 1.9 },
    { time: "24:00", incidents: 3, responseTime: 2.0 },
  ];

  const SEVERITY_DATA = [
    { name: "CRITICAL", count: 4, fill: "#EF4444" },
    { name: "HIGH", count: 9, fill: "#F59E0B" },
    { name: "MEDIUM", count: 18, fill: "#38BDF8" },
    { name: "LOW", count: 12, fill: "#10B981" },
  ];

  return (
    <div className="surface-card p-5 border border-white/[0.08] flex flex-col space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              INCIDENT & PERFORMANCE ANALYTICS
            </h3>
            <p className="text-[10px] text-zinc-400">Autonomous Incident Metrics & Intelligence</p>
          </div>
        </div>

        {/* Time controls */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
          {["1H", "24H", "7D", "30D"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeRange === t
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight Card Header */}
      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3">
        <Sparkles size={18} className="text-indigo-400 shrink-0" />
        <p className="text-xs text-indigo-200 font-sans leading-relaxed">
          <strong className="text-white">✦ AI Insight:</strong> Incident frequency increased 18% compared with the previous period due to scheduled batch deployments. Auto-remediation successfully mitigated 92% of occurrences without human intervention.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Incident Activity Chart */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] h-60 flex flex-col">
          <div className="text-[11px] font-bold text-white font-mono mb-2">
            Incident Activity & Response Trend ({timeRange})
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#71717A" fontSize={10} />
                <YAxis stroke="#71717A" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090A0F",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] h-60 flex flex-col">
          <div className="text-[11px] font-bold text-white font-mono mb-2">
            Severity Distribution ({timeRange})
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEVERITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#71717A" fontSize={10} />
                <YAxis stroke="#71717A" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090A0F",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
