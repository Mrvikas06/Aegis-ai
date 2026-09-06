import { motion, AnimatePresence } from "motion/react";
import { Radio } from "lucide-react";

const TYPE_CFG = {
  fact:       { label: "FACT",       bg: "rgba(34,211,140,0.08)", border: "rgba(34,211,140,0.2)", dot: "#22D38C", text: "#22D38C" },
  hypothesis: { label: "HYPOTHESIS", bg: "rgba(255,172,50,0.08)",  border: "rgba(255,172,50,0.2)",  dot: "#FFAC32", text: "#FFAC32" },
  action:     { label: "ACTION",     bg: "rgba(80,160,255,0.08)",  border: "rgba(80,160,255,0.2)",  dot: "#80B4FF", text: "#80B4FF" },
  decision:   { label: "DECISION",   bg: "rgba(120,96,255,0.08)",  border: "rgba(120,96,255,0.2)",  dot: "#A898FF", text: "#A898FF" },
  system_event: { label: "SYSTEM",   bg: "rgba(58,64,96,0.1)",     border: "rgba(58,64,96,0.3)",     dot: "#4A5280", text: "#4A5280" },
};

const SAMPLE = [
  { id: "s1", text: "DB connection pool exhausted at 100/100 max connections", type: "fact",       speakerId: "Priya",  time: "14:03" },
  { id: "s2", text: "v2.14 deploy may have introduced N+1 query loop in tax calc", type: "hypothesis", speakerId: "Sam",    time: "14:04" },
  { id: "s3", text: "Execute rollback via Jenkins Pipeline checkout-service", type: "action",     speakerId: "Meera",  time: "14:05" },
  { id: "s4", text: "Rollback v2.14 immediately to stabilize gateway", type: "decision",   speakerId: "Arjun",  time: "14:06" },
];

export default function KnowledgeFeed({ items = [], participants = [] }) {
  const nameFor = (id) => {
    if (id === "aegis") return "Aegis";
    return participants.find(p => p.id === id)?.name || id;
  };

  const display = items.length ? [...items].reverse().slice(0, 12) : SAMPLE;

  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio size={13} style={{ color: "#7C60FF" }} />
          <span className="text-sm font-semibold" style={{ color: "#E8EDF8" }}>Live Signal Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full anim-pulse2" style={{ background: "#22D38C" }} />
          <span className="text-[10px] font-mono" style={{ color: "#22D38C" }}>LIVE · {display.length} signals</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {display.map((item, idx) => {
            const cfg = TYPE_CFG[item.type] || TYPE_CFG.system_event;
            const name = nameFor(item.speakerId);
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 p-2.5 rounded-xl group cursor-default"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>

                {/* Type indicator */}
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                  <div className="h-2 w-2 rounded-full" style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: cfg.text }}>{cfg.label}</span>
                    <span className="text-[9px]" style={{ color: "#3A4060" }}>{name}</span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: "#BCC8E0" }}>{item.text}</p>
                </div>

                <span className="text-[9px] font-mono shrink-0 pt-0.5" style={{ color: "#3A4060" }}>
                  {item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—")}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
