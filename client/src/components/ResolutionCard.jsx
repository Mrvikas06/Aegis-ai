import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";

export default function ResolutionCard({ summary, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 flex flex-col gap-4"
      style={{ border: "1px solid rgba(35,209,139,0.25)", background: "rgba(35,209,139,0.04)" }}>
      <div className="flex items-center gap-2">
        <CheckCircle size={16} style={{ color: "#23D18B" }} />
        <span className="text-sm font-semibold" style={{ color: "#23D18B" }}>Incident Closed</span>
      </div>
      <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" style={{ color: "#8892B0" }}>
        {summary}
      </pre>
      <button onClick={onClose}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: "rgba(35,209,139,0.1)", border: "1px solid rgba(35,209,139,0.2)", color: "#23D18B" }}>
        Dismiss
      </button>
    </motion.div>
  );
}
