import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

export default function StatusBanner({ openQuestions = [] }) {
  if (!openQuestions.length) return null;
  const LABELS = {
    impact_scope: "Impact scope",
    start_time: "Start time",
    affected_systems: "Affected systems",
    customer_facing_status: "Customer status",
    mitigation_owner: "Mitigation owner",
  };
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{ background: "rgba(255,179,71,0.07)", border: "1px solid rgba(255,179,71,0.15)" }}>
      <AlertTriangle size={13} style={{ color: "#FFB347", flexShrink: 0 }} />
      <p className="text-xs" style={{ color: "#FFB347" }}>
        Still missing: {openQuestions.map((q) => LABELS[q] || q).join(" · ")}
      </p>
    </motion.div>
  );
}
