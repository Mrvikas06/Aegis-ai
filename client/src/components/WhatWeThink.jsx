import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";

export default function WhatWeThink({ items = [] }) {
  const hyps = items.filter((i) => i.type === "hypothesis" && !i.stale);
  const display = hyps.length ? hyps : [
    { id: "h1", text: "Checkout service v2.4 leaking DB connections", speakerId: "p2" },
    { id: "h2", text: "ORM misconfiguration not releasing connections after timeout", speakerId: "p3" },
  ];
  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <HelpCircle size={14} style={{ color: "#FFB347" }} />
        <span className="text-sm font-semibold" style={{ color: "#EDF0F8" }}>Hypotheses</span>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,179,71,0.1)", color: "#FFB347" }}>{display.length}</span>
      </div>
      <div className="space-y-2">
        {display.map((h, i) => (
          <motion.div key={h.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl"
            style={{ background: "rgba(255,179,71,0.04)", border: "1px solid rgba(255,179,71,0.1)" }}>
            <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#FFB347" }} />
            <p className="text-xs leading-snug" style={{ color: "#BCC5E0" }}>{h.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
