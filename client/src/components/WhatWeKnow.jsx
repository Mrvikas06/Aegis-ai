import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export default function WhatWeKnow({ items = [] }) {
  const facts = items.filter((i) => i.type === "fact");
  const display = facts.length ? facts : [
    { id: "f1", text: "Payment API error rate at 38.2% on /checkout endpoint", speakerId: "p4" },
    { id: "f2", text: "DB connection pool exhausted — 100/100 connections in use", speakerId: "p2" },
    { id: "f3", text: "Incident started at 10:28 AM, correlates with v2.4 deploy", speakerId: "p1" },
  ];
  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} style={{ color: "#23D18B" }} />
        <span className="text-sm font-semibold" style={{ color: "#EDF0F8" }}>Confirmed Facts</span>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(35,209,139,0.1)", color: "#23D18B" }}>{display.length}</span>
      </div>
      <div className="space-y-2">
        {display.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl"
            style={{ background: "rgba(35,209,139,0.04)", border: "1px solid rgba(35,209,139,0.1)" }}>
            <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#23D18B" }} />
            <p className="text-xs leading-snug" style={{ color: "#BCC5E0" }}>{f.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
