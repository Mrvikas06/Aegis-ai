import React, { useState } from "react";
import { Clock, Download, Filter, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { INITIAL_TIMELINE } from "../lib/store";

export default function TimelineView({ onExport }) {
  const [timelineEvents] = useState(INITIAL_TIMELINE);
  const [typeFilter, setTypeFilter] = useState("ALL");

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-white font-sans font-semibold">
            Incident Timeline
          </h1>
          <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
            Audit log of autonomous AI decisions, system events, and mitigation actions
          </p>
        </div>

        <button onClick={onExport} className="btn-secondary text-xs">
          <Download size={14} />
          <span>Export Post-Mortem Report</span>
        </button>
      </div>

      {/* Timeline Feed */}
      <div className="panel-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs font-mono text-zinc-400">CHRONOLOGICAL AUDIT TRAIL</span>
          <span className="badge badge-indigo">{timelineEvents.length} Events Logged</span>
        </div>

        <div className="space-y-4 relative pl-4 border-l border-indigo-500/30">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-zinc-950" />

              <div className="p-3 rounded-xl bg-surface-subtle border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-sans">{ev.event}</span>
                  <span className="text-[11px] font-mono text-zinc-500">{ev.time}</span>
                </div>
                <div className="text-[10px] font-mono text-indigo-400 uppercase">
                  TYPE: {ev.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
