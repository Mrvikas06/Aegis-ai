import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";

export default function NudgeToast({ nudges = [], onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {nudges.slice(-3).map((nudge) => (
          <motion.div key={nudge.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20 }}
            onClick={() => onDismiss?.(nudge.id)}
            className="flex items-start gap-2.5 p-3.5 rounded-xl cursor-pointer max-w-xs"
            style={{ background: "rgba(30,35,56,0.95)", border: "1px solid rgba(255,179,71,0.25)", backdropFilter: "blur(20px)" }}>
            <Bell size={13} style={{ color: "#FFB347", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "#BCC5E0" }}>{nudge.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
