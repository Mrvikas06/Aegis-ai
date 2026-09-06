import React from "react";
import AgentOrchestrationCanvas from "../components/AgentOrchestrationCanvas";
import { Network, Zap, RotateCcw } from "lucide-react";

export default function OrchestrationView({
  isSimulating,
  simulationStep,
  onStartSimulation,
  onResetSimulation,
}) {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-white font-sans font-semibold">
            Multi-Agent Orchestration Network
          </h1>
          <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
            Real-Time Autonomous Agent Network & Causal Inference Graph
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onResetSimulation} className="btn-secondary text-xs">
            <RotateCcw size={14} />
            <span>Reset Simulation</span>
          </button>
          <button onClick={onStartSimulation} disabled={isSimulating} className="btn-primary text-xs">
            <Zap size={14} className={isSimulating ? "animate-spin" : ""} />
            <span>{isSimulating ? "Simulation Running..." : "Simulate Anomaly Flow"}</span>
          </button>
        </div>
      </div>

      {/* Expanded Canvas Container */}
      <div className="w-full">
        <AgentOrchestrationCanvas
          isSimulating={isSimulating}
          simulationStep={simulationStep}
          onStartSimulation={onStartSimulation}
          onResetSimulation={onResetSimulation}
        />
      </div>

      {/* Autonomous Sub-Agent Roster */}
      <div className="panel-card p-4 space-y-3">
        <h3 className="text-card-head text-white">Autonomous Agent Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-subtle border border-white/5 space-y-1">
            <div className="text-indigo-400 font-semibold">Monitor Agent</div>
            <div className="text-zinc-400">24/7 Telemetry Scanner</div>
            <div className="text-[10px] text-emerald-400">Status: Active (100%)</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-subtle border border-white/5 space-y-1">
            <div className="text-purple-400 font-semibold">Root Cause Agent</div>
            <div className="text-zinc-400">Causal Inference Engine</div>
            <div className="text-[10px] text-cyan-400">Confidence: 94.2%</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-subtle border border-white/5 space-y-1">
            <div className="text-amber-400 font-semibold">Risk Analysis Agent</div>
            <div className="text-zinc-400">Blast Radius Assessor</div>
            <div className="text-[10px] text-zinc-400">Risk: 0.06%</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-subtle border border-white/5 space-y-1">
            <div className="text-emerald-400 font-semibold">Verification Agent</div>
            <div className="text-zinc-400">Post-Fix Verifier</div>
            <div className="text-[10px] text-emerald-400">P99 Restored: 18ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
