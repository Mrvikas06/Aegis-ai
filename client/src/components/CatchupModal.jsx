import { motion, AnimatePresence } from "motion/react";
import { X, Shield } from "lucide-react";

export default function CatchupModal({ open, briefing, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(9,11,18,0.85)", backdropFilter: "blur(12px)" }}>
          <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}
            className="glass w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7C6FFF, #5B4FE8)" }}>
                  <Shield size={15} color="white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: "#EDF0F8" }}>Catch-up Briefing</span>
              </div>
              <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#4A5280" }}>
                <X size={13} />
              </button>
            </div>
            <div className="p-4 rounded-xl text-xs leading-relaxed"
              style={{ background: "rgba(124,111,255,0.06)", border: "1px solid rgba(124,111,255,0.12)", color: "#BCC5E0" }}>
              {briefing || "Generating catch-up briefing..."}
            </div>
            <button onClick={onClose}
              className="w-full py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: "rgba(124,111,255,0.15)", border: "1px solid rgba(124,111,255,0.25)", color: "#A89CFF" }}>
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
