import React, { useState } from "react";
import { SearchCode, FileSearch, Filter, Terminal, RefreshCw, AlertCircle } from "lucide-react";

export default function InvestigationsView() {
  const [logFilter, setLogFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const LOGS = [
    { time: "12:42:01", level: "ERROR", service: "postgres-cluster", message: "FATAL: remaining connection slots are reserved for non-replication superuser connections (200/200)" },
    { time: "12:42:03", level: "WARN",  service: "api-gateway",      message: "Client acquire timeout (5000ms) waiting for db connection pool" },
    { time: "12:42:05", level: "INFO",  service: "worker-cluster",   message: "Executing batch_payout_sync() iteration 4" },
    { time: "12:42:08", level: "ERROR", service: "api-gateway",      message: "HTTP 504 Gateway Timeout on POST /v1/checkout" },
    { time: "12:42:12", level: "WARN",  service: "auth-service",     message: "JWT validation latency high (240ms)" },
    { time: "12:42:15", level: "INFO",  service: "aegis-agent",      message: "Correlated 4,200 log error events with postgres connection pool saturation" },
  ];

  const filteredLogs = LOGS.filter((l) => {
    const matchesLevel = logFilter === "ALL" || l.level === logFilter;
    const matchesSearch =
      l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-white font-sans font-semibold">
          Investigations Workspace
        </h1>
        <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
          Real-time log analyzer, telemetry stream, and dependency correlation
        </p>
      </div>

      {/* Toolbar */}
      <div className="panel-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs by keyword or service..."
            className="input-field pl-9 w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-white/5 text-xs font-mono">
          <span className="text-zinc-500 px-1 text-[10px]">LEVEL:</span>
          {["ALL", "ERROR", "WARN", "INFO"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLogFilter(lvl)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                logFilter === lvl
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log Console Output */}
      <div className="panel-card p-4 space-y-2 bg-black font-mono text-xs border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-zinc-500 text-[10px]">
          <span>STREAM: TELEMETRY_LOG_PIPE_01</span>
          <span>PARSING 14,820 EVENTS/SEC</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto py-2">
          {filteredLogs.map((l, i) => (
            <div key={i} className="flex items-start gap-3 text-[11px] leading-relaxed border-b border-white/[0.04] pb-1.5">
              <span className="text-zinc-500 shrink-0">{l.time}</span>
              <span
                className={`badge shrink-0 text-[10px] ${
                  l.level === "ERROR"
                    ? "badge-critical"
                    : l.level === "WARN"
                    ? "badge-high"
                    : "badge-indigo"
                }`}
              >
                {l.level}
              </span>
              <span className="text-indigo-300 font-semibold shrink-0">[{l.service}]</span>
              <span className="text-zinc-300 flex-1">{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
