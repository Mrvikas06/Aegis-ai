import { motion } from "motion/react";
import { AlertOctagon } from "lucide-react";

export default function ConflictCard({ conflicts = [] }) {
  if (!conflicts.length) return null;
  return (
    <div className="glass p-4 flex flex-col gap-3"
      style={{ border: "1px solid rgba(255,77,77,0.2)", background: "rgba(255,77,77,0.04)" }}>
      <div className="flex items-center gap-2">
        <AlertOctagon size={13} style={{ color: "#FF7070" }} />
        <span className="text-xs font-semibold" style={{ color: "#FF7070" }}>
          {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} Detected
        </span>
      </div>
      <div className="space-y-2">
        {conflicts.map(([a, b], i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs p-2.5 rounded-xl space-y-1"
            style={{ background: "rgba(255,77,77,0.05)", border: "1px solid rgba(255,77,77,0.12)" }}>
            <p style={{ color: "#BCC5E0" }}>"{a.text}"</p>
            <p className="font-medium" style={{ color: "#FF7070" }}>vs</p>
            <p style={{ color: "#BCC5E0" }}>"{b.text}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
