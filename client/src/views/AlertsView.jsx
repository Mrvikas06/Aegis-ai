import React, { useState } from "react";
import { Bell, AlertTriangle, Zap, Check, X } from "lucide-react";
import { INITIAL_NOTIFICATIONS } from "../lib/store";

export default function AlertsView({ onStartSimulation }) {
  const [alerts, setAlerts] = useState(INITIAL_NOTIFICATIONS);

  const handleDismiss = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-white font-sans font-semibold">
            System Alerts
          </h1>
          <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
            Real-time infrastructure threshold and anomaly alerts
          </p>
        </div>

        <button onClick={onStartSimulation} className="btn-primary text-xs">
          <Zap size={14} />
          <span>Triage Anomaly</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="panel-card p-4 space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-3.5 rounded-xl bg-surface-subtle border border-white/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 mt-0.5">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{alt.title}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{alt.time}</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">{alt.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartSimulation?.()}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  <Zap size={13} className="text-indigo-400" />
                  <span>Investigate</span>
                </button>
                <button
                  onClick={() => handleDismiss(alt.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10"
                  title="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-zinc-500 font-mono text-xs">
            No active alerts. All thresholds nominal.
          </div>
        )}
      </div>
    </div>
  );
}
