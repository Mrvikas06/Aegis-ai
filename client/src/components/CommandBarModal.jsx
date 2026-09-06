import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Zap, Shield, Server, FileText, ArrowRight, X } from "lucide-react";

export default function CommandBarModal({ isOpen, onClose, onSelectCommand }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const COMMANDS = [
    { id: "simulate", label: "Simulate End-to-End Incident Lifecycle", icon: Zap, category: "Action" },
    { id: "scenario:payment", label: "Run Scenario: Payment Gateway Outage", icon: Shield, category: "Scenario" },
    { id: "scenario:db", label: "Run Scenario: Database Pool Saturation", icon: Server, category: "Scenario" },
    { id: "root_cause", label: "Open Root Cause Causal Graph", icon: FileText, category: "Analysis" },
  ];

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-white/10 bg-surface-primary/80">
            <Search size={18} className="text-zinc-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search incidents & services..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              autoFocus
            />
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Command List */}
          <div className="p-2 max-h-72 overflow-y-auto space-y-1">
            {filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onSelectCommand?.(cmd.id);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-600/20 text-xs text-zinc-200 hover:text-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 text-indigo-400 group-hover:bg-indigo-500/20">
                      <Icon size={14} />
                    </div>
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-500 group-hover:text-indigo-300">
                    {cmd.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-zinc-900 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Navigation: ↑ ↓ Enter to select</span>
            <span>Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
