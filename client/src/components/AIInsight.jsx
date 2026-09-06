import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function AIInsight({ insight }) {
  const text = insight || "Aegis is monitoring the incident room. All facts, hypotheses, and action items are being tracked in real time.";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="glass p-4 flex items-start gap-3">
      <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(135deg, #7C6FFF, #5B4FE8)", boxShadow: "0 0 16px rgba(124,111,255,0.4)" }}>
        <Sparkles size={13} color="white" />
      </div>
      <div>
        <div className="text-[10px] font-mono mb-1" style={{ color: "#4A5280" }}>Aegis Insight</div>
        <p className="text-xs leading-relaxed" style={{ color: "#BCC5E0" }}>{text}</p>
      </div>
    </motion.div>
  );
}
