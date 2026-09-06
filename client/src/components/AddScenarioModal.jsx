import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, AlertTriangle, ShieldAlert, Sparkles, Check, Server } from "lucide-react";

export default function AddScenarioModal({ isOpen, onClose, onAddScenario }) {
  const [title, setTitle] = useState("");
  const [sev, setSev] = useState(1);
  const [service, setService] = useState("payment-api");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newScenario = {
      key: `custom_${Date.now()}`,
      label: `⚡ ${title}`,
      sev: Number(sev),
      service,
      description: description || `Automated alert triggered: ${title} on ${service}`,
    };

    onAddScenario(newScenario);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle("");
      setDescription("");
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#121624] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Add Custom Incident Scenario
                </h3>
                <p className="text-xs text-zinc-400">
                  Inject a custom failure mode into live Aegis AI telemetry
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Scenario Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Scenario Title / Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Redis Cluster Memory Leak Outage"
                className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none font-sans"
              />
            </div>

            {/* Severity & Affected Service */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Severity Level
                </label>
                <select
                  value={sev}
                  onChange={(e) => setSev(Number(e.target.value))}
                  className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                >
                  <option value={1}>SEV-1 (Critical Outage)</option>
                  <option value={2}>SEV-2 (Major Degradation)</option>
                  <option value={3}>SEV-3 (Minor Anomaly)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Primary Service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-sans"
                >
                  <option value="payment-api">Payment API</option>
                  <option value="postgres-db">Postgres Database</option>
                  <option value="auth-svc">Auth Service</option>
                  <option value="checkout">Checkout Gateway</option>
                  <option value="web-gateway">Web Gateway</option>
                </select>
              </div>
            </div>

            {/* Description / Initial Alert */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Initial Alert Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Latency spiked to 2,400ms. PagerDuty alert fired for payment-api service."
                rows={3}
                className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none font-sans resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitted}
                className="btn-primary text-xs h-9 px-5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                {submitted ? <Check size={14} /> : <Sparkles size={14} />}
                <span>{submitted ? "Scenario Injected!" : "Inject & Run Scenario"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
