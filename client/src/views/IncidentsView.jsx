import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Server,
  Users,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { INITIAL_INCIDENTS } from "../lib/store";

export default function IncidentsView({
  onSelectIncident,
  onQuickAction,
  onStartSimulation,
}) {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredIncidents = incidents.filter((inc) => {
    const matchesQuery =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === "ALL" || inc.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || inc.status === statusFilter;
    return matchesQuery && matchesSev && matchesStatus;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-white font-sans font-semibold">
            Live Incidents
          </h1>
          <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
            Active and resolved incident intelligence across infrastructure services
          </p>
        </div>

        <button onClick={onStartSimulation} className="btn-primary text-xs">
          <Zap size={14} />
          <span>Simulate New Incident</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="panel-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter incidents by title or service..."
              className="input-field pl-9 w-full text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-white/5 text-xs font-mono">
            <span className="text-zinc-500 px-1 text-[10px]">SEV:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  severityFilter === sev
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs font-mono bg-surface-subtle cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Investigating">Investigating</option>
            <option value="Root Cause Found">Root Cause Found</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>
      </div>

      {/* Incidents Data Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-subtle text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Target Service</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident?.(inc)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`badge ${
                          inc.severity === "CRITICAL"
                            ? "badge-critical"
                            : inc.severity === "HIGH"
                            ? "badge-high"
                            : "badge-medium"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">
                      {inc.title}
                      <div className="text-[11px] font-mono text-zinc-400 font-normal mt-0.5">
                        Started {inc.started}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-indigo-300">
                      {inc.service}
                    </td>

                    <td className="py-3 px-4 text-zinc-300">
                      {inc.impact}
                    </td>

                    <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                      {inc.confidence}%
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-mono">
                      {inc.assignee}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAction?.("investigate", inc);
                        }}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        <Zap size={13} />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                    No incidents matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
