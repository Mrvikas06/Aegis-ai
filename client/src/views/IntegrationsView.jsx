import React, { useState } from "react";
import { Boxes, CheckCircle2, RefreshCw, Sliders, ExternalLink } from "lucide-react";
import { INITIAL_INTEGRATIONS } from "../lib/store";

export default function IntegrationsView() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  const toggleStatus = (id) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "Connected" ? "Disconnected" : "Connected" }
          : i
      )
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-white font-sans font-semibold">
          Integrations & Connectors
        </h1>
        <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
          Connect Aegis AI to your monitoring, ticketing, chatops, and infrastructure tools
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const isConnected = item.status === "Connected";

          return (
            <div
              key={item.id}
              className="panel-card p-4 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white font-sans">{item.name}</span>
                  <span
                    className={`badge ${
                      isConnected ? "badge-success" : "badge-neutral"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-400">
                  CATEGORY: {item.category}
                </div>
                <div className="text-xs text-zinc-300 mt-2">
                  Sync: {item.sync}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`btn-secondary text-xs py-1 px-3 ${
                    isConnected ? "text-rose-400 hover:text-rose-300" : "text-emerald-400"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect Tool"}
                </button>

                <button className="p-1.5 rounded-lg text-zinc-500 hover:text-white">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
