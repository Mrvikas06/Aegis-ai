import { Users, Mic } from "lucide-react";
import { motion } from "motion/react";

const ROLE_CFG = {
  incident_commander: { color: "#A898FF", label: "IC",      badge: "#7C60FF" },
  deputy_ic:          { color: "#80B4FF", label: "Deputy",  badge: "#4080FF" },
  engineer:           { color: "#22D38C", label: "Eng",     badge: "#22D38C" },
  support:            { color: "#FFAC32", label: "Support", badge: "#FFAC32" },
  business:           { color: "#FF8080", label: "Biz",     badge: "#FF6060" },
  unknown:            { color: "#4A5280", label: "?",       badge: "#4A5280" },
};

const SAMPLE = [
  { id: "p1", name: "Meera",  role: "incident_commander" },
  { id: "p2", name: "Arjun",  role: "deputy_ic" },
  { id: "p3", name: "Priya",  role: "engineer" },
  { id: "p4", name: "Sam",    role: "engineer" },
  { id: "p5", name: "Divya",  role: "support" },
  { id: "p6", name: "Karan",  role: "business" },
];

export default function ParticipantsRail({ participants = [] }) {
  const display = participants.length ? participants : SAMPLE;
  return (
    <div className="glass p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={13} style={{ color: "#4A5280" }} />
          <span className="text-sm font-semibold" style={{ color: "#E8EDF8" }}>Room</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22D38C", boxShadow: "0 0 6px #22D38C" }} />
          <span className="text-[10px] font-mono" style={{ color: "#22D38C" }}>{display.length} online</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {display.map((p, i) => {
          const cfg = ROLE_CFG[p.role] || ROLE_CFG.unknown;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="h-7 w-7 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 relative"
                style={{ background: `${cfg.color}15`, color: cfg.color }}>
                {p.name.charAt(0)}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border"
                  style={{ background: "#22D38C", borderColor: "rgba(6,8,15,1)" }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium truncate" style={{ color: "#E8EDF8" }}>{p.name}</div>
                <div className="text-[9px] font-mono" style={{ color: cfg.color }}>{cfg.label}</div>
              </div>
            </motion.div>
          );
        })}
        {/* Aegis agent */}
        <div className="flex items-center gap-2 p-2 rounded-xl col-span-2"
          style={{ background: "rgba(120,96,255,0.08)", border: "1px solid rgba(120,96,255,0.18)" }}>
          <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#7C60FF,#4B3BCE)" }}>
            <Mic size={12} color="white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "#A898FF" }}>Aegis AI</div>
            <div className="text-[9px] font-mono" style={{ color: "#7C60FF" }}>Commander · Agora Voice</div>
          </div>
          <div className="ml-auto h-1.5 w-1.5 rounded-full anim-pulse2" style={{ background: "#7C60FF" }} />
        </div>
      </div>
    </div>
  );
}
