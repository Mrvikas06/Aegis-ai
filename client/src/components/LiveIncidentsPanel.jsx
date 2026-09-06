import React from "react";
import { motion } from "motion/react";
import { Clock, Server, Users, Zap, ShieldAlert, ArrowUpRight } from "lucide-react";
import { INITIAL_INCIDENTS } from "../lib/store";

export default function LiveIncidentsPanel({
  incidents = [],
  onSelectIncident,
  onQuickAction,
}) {
  const list = incidents.length > 0 ? incidents : INITIAL_INCIDENTS;

  return (
    <div className="surface-workspace p-4 flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            LIVE INCIDENTS
          </h3>
        </div>
        <span className="badge-tag badge-critical font-bold">
          {list.length} ACTIVE
        </span>
      </div>

      {/* Refined Minimal Incident List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {list.map((inc) => {
          const isCritical = inc.severity === "CRITICAL";
          const isHigh = inc.severity === "HIGH";

          return (
            <motion.div
              key={inc.id}
              whileHover={{ x: 2 }}
              onClick={() => onSelectIncident?.(inc)}
              className={`p-3 rounded-xl cursor-pointer bg-surface-subtle-panel border transition-all relative group ${
                isCritical
                  ? "border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.12)]"
                  : isHigh
                  ? "border-amber-500/30 hover:border-amber-500/50"
                  : "border-white/[0.06] hover:border-white/15"
              }`}
            >
              {/* Severity & Status Indicator */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`badge-tag ${
                    isCritical
                      ? "badge-critical"
                      : isHigh
                      ? "badge-high"
                      : "badge-medium"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? "bg-rose-400 animate-ping" : "bg-current"}`} />
                  {inc.severity}
                </span>

                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock size={11} />
                  {inc.started}
                </span>
              </div>

              {/* Title & Service */}
              <h4 className="text-xs font-bold text-white font-sans group-hover:text-indigo-300 transition-colors">
                {inc.title}
              </h4>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Server size={11} />
                  {inc.service}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Users size={11} className="text-cyan-400" />
                  {inc.impact}
                </span>
              </div>

              {/* AI Confidence Bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${inc.confidence}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-indigo-300 font-semibold">
                  {inc.confidence}% AI Confidence
                </span>
              </div>

              {/* Quick Actions Hover Overlay */}
              <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction?.("investigate", inc);
                  }}
                  className="btn-primary text-xs h-7 px-3"
                >
                  <Zap size={12} />
                  <span>Investigate</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction?.("details", inc);
                  }}
                  className="btn-secondary text-xs h-7 px-3"
                >
                  <span>Details</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
