import React from "react";
import { Server, Zap, GitMerge, ShieldCheck, Activity } from "lucide-react";
import { INITIAL_SERVICES } from "../lib/store";

export default function ServicesView({ onSelectService }) {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-white font-sans font-semibold">
          Infrastructure Services
        </h1>
        <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
          Real-time service health, P99 latency telemetry, and AI predictive risk
        </p>
      </div>

      {/* Services Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-subtle text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">P99 Latency</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">AI Predictive Risk</th>
                <th className="py-3 px-4">Dependencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {INITIAL_SERVICES.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectService?.(s)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`badge ${
                        s.status === "DEGRADED"
                          ? "badge-critical"
                          : s.status === "WARNING"
                          ? "badge-high"
                          : "badge-success"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-300">{s.latency}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{s.availability}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{s.riskPrediction}</td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    {s.deps.length > 0 ? s.deps.join(", ") : "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
