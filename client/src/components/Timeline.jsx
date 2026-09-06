import { motion } from "motion/react";
import { Clock, AlertTriangle, Zap, CheckSquare, Info, Shield } from "lucide-react";

const ENTRY_CFG = {
  fact:         { color: "#23D18B", icon: Info },
  hypothesis:   { color: "#FFB347", icon: AlertTriangle },
  action:       { color: "#7FB8FF", icon: CheckSquare },
  decision:     { color: "#A89CFF", icon: Zap },
  system_event: { color: "#4A5280", icon: Shield },
};

export default function Timeline({ entries = [] }) {
  const display = entries.length ? entries.slice(-15).reverse() : [
    { id: "t1", entryType: "system_event", summary: "Incident opened — Payment Gateway Outage", timestamp: new Date(Date.now() - 15*60000) },
    { id: "t2", entryType: "fact",         summary: "Error rate at 38.2% on checkout endpoint", timestamp: new Date(Date.now() - 12*60000) },
    { id: "t3", entryType: "hypothesis",   summary: "DB connection pool may be exhausted", timestamp: new Date(Date.now() - 10*60000) },
    { id: "t4", entryType: "action",       summary: "Arjun: increase max_connections to 200", timestamp: new Date(Date.now() - 8*60000) },
    { id: "t5", entryType: "decision",     summary: "IC approved DB config change rollout", timestamp: new Date(Date.now() - 4*60000) },
  ];

  return (
    <div className="glass p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock size={14} style={{ color: "#4A5280" }} />
        <span className="text-sm font-semibold" style={{ color: "#EDF0F8" }}>Timeline</span>
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(124,111,255,0.3), rgba(74,82,128,0.1))" }} />
        <div className="space-y-3">
          {display.map((e, idx) => {
            const cfg = ENTRY_CFG[e.entryType] || ENTRY_CFG.system_event;
            const Icon = cfg.icon;
            const ts = e.timestamp ? new Date(e.timestamp) : new Date();
            const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <motion.div key={e.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                className="flex items-start gap-3 pl-1">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 relative z-10"
                  style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                  <Icon size={11} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug" style={{ color: "#BCC5E0" }}>{e.summary}</p>
                  <span className="text-[10px] font-mono mt-0.5 block" style={{ color: "#4A5280" }}>{timeStr}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
