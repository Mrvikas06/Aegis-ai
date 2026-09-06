import React from "react";
import { motion } from "motion/react";
import TopMetricsRail from "../components/TopMetricsRail";
import LiveIncidentsPanel from "../components/LiveIncidentsPanel";
import ServiceHealthGrid from "../components/ServiceHealthGrid";
import ResolutionBanner from "../components/ResolutionBanner";
import { Sparkles, ShieldCheck, Activity, ArrowRight, Zap } from "lucide-react";

export default function OverviewView({
  isSimulating,
  simulationStep,
  showResolutionBanner,
  onCloseResolution,
  onStartSimulation,
  onSelectIncident,
  onQuickAction,
  onSelectService,
  onNavigateTab,
}) {
  return (
    <div className="space-y-4 pb-6">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-white font-sans font-semibold">
            Overview
          </h1>
          <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
            Autonomous Incident Management & System Telemetry Summary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab?.("commander")}
            className="btn-secondary text-xs"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span>Open AI Commander</span>
          </button>

          <button
            onClick={onStartSimulation}
            disabled={isSimulating}
            className="btn-primary text-xs"
          >
            <Zap size={14} className={isSimulating ? "animate-spin" : ""} />
            <span>{isSimulating ? "Simulation Running..." : "Simulate Incident"}</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Rail */}
      <TopMetricsRail
        activeIncidents={isSimulating ? 13 : 12}
        resolvedToday={showResolutionBanner ? 35 : 34}
        avgResponseTime="2m 18s"
        aiConfidence={98.4}
      />

      {/* Resolution Banner */}
      <ResolutionBanner
        isVisible={showResolutionBanner}
        resolutionTime="2m 18s"
        confidence={98.4}
        onClose={onCloseResolution}
      />

      {/* 2-Column Grid: Incidents + Service Health */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <LiveIncidentsPanel
            onSelectIncident={onSelectIncident}
            onQuickAction={onQuickAction}
          />
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-4">
          <ServiceHealthGrid onSelectService={onSelectService} />

          {/* Quick Orchestration Summary Panel */}
          <div className="panel-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                <h3 className="text-card-head text-white">Multi-Agent Engine Status</h3>
              </div>
              <button
                onClick={() => onNavigateTab?.("orchestration")}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View Full Canvas</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <p className="text-body-sm text-zinc-400">
              12 autonomous sub-agents actively scanning logs, P99 metrics, and service dependencies.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-surface-subtle border border-white/5">
                <div className="text-zinc-500 text-[10px]">MONITOR AGENT</div>
                <div className="text-emerald-400 font-semibold mt-0.5">● Active</div>
              </div>
              <div className="p-2 rounded-lg bg-surface-subtle border border-white/5">
                <div className="text-zinc-500 text-[10px]">ROOT CAUSE AGENT</div>
                <div className="text-indigo-400 font-semibold mt-0.5">94% Confident</div>
              </div>
              <div className="p-2 rounded-lg bg-surface-subtle border border-white/5">
                <div className="text-zinc-500 text-[10px]">VERIFICATION AGENT</div>
                <div className="text-cyan-400 font-semibold mt-0.5">Standby</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
