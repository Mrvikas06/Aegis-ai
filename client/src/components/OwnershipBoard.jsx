import { motion } from "motion/react";
import { ClipboardList, CheckCircle2, AlertCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

const STATUS_CFG = {
  open:        { color: "#FFAC32", label: "Open",        icon: Clock,         bg: "rgba(255,172,50,0.1)"  },
  in_progress: { color: "#80B4FF", label: "In Progress", icon: ChevronRight,  bg: "rgba(80,160,255,0.1)"  },
  done:        { color: "#22D38C", label: "Done",        icon: CheckCircle2,  bg: "rgba(34,211,140,0.1)"  },
  blocked:     { color: "#FF4646", label: "Blocked",     icon: XCircle,       bg: "rgba(255,70,70,0.1)"   },
};

const SAMPLE = [
  { id: "a1", text: "Increase DB max_connections to 200 as mitigation",    status: "in_progress", ownerName: "Priya" },
  { id: "a2", text: "Execute rollback of checkout-service v2.14 via CLI",  status: "open",        ownerName: "Sam" },
  { id: "a3", text: "Post Statuspage customer update",                     status: "open",        ownerName: "Divya" },
  { id: "a4", text: "Kafka consumer lag monitoring check",                 status: "done",        ownerName: "Arjun" },
];

export default function OwnershipBoard({ items = [], participants = [], incidentId }) {
  const [updating, setUpdating] = useState(null);

  const actions = items.filter(i => i.type === "action");
  const display = actions.length ? actions.map(a => ({
    ...a,
    ownerName: participants.find(p => p.id === a.ownerId)?.name || "Unassigned",
  })) : SAMPLE;

  const open = display.filter(d => d.status !== "done").length;
  const done = display.filter(d => d.status === "done").length;

  const cycleStatus = async (item) => {
    if (!incidentId || item.id?.startsWith("a")) return; // sample items
    const next = { open: "in_progress", in_progress: "done", done: "open" };
    const newStatus = next[item.status] || "open";
    setUpdating(item.id);
    try {
      await fetch(`http://localhost:4000/api/incidents/${incidentId}/items/${item.id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } finally { setUpdating(null); }
  };

  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={13} style={{ color: "#80B4FF" }} />
          <span className="text-sm font-semibold" style={{ color: "#E8EDF8" }}>Action Board</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,172,50,0.1)", border: "1px solid rgba(255,172,50,0.2)", color: "#FFAC32" }}>{open} open</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(34,211,140,0.1)", border: "1px solid rgba(34,211,140,0.2)", color: "#22D38C" }}>{done} done</span>
        </div>
      </div>

      {/* Progress bar */}
      {display.length > 0 && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div className="h-full rounded-full" initial={{ width: 0 }}
            animate={{ width: `${(done / display.length) * 100}%` }}
            style={{ background: "linear-gradient(90deg,#22D38C,#80B4FF)" }} />
        </div>
      )}

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {display.map((a, i) => {
          const cfg = STATUS_CFG[a.status] || STATUS_CFG.open;
          const Icon = cfg.icon;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl flex items-center gap-3 group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => cycleStatus(a)} disabled={updating === a.id}
                className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-all hover:scale-110"
                style={{ background: cfg.bg }}>
                <Icon size={12} style={{ color: cfg.color }} />
              </button>
              <p className="flex-1 text-[11px] leading-snug" style={{ color: a.status === "done" ? "#4A5280" : "#BCC8E0", textDecoration: a.status === "done" ? "line-through" : "none" }}>
                {a.text}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                  {cfg.label}
                </span>
                <span className="text-[10px]" style={{ color: "#3A4060" }}>{a.ownerName}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
