import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Check, X } from "lucide-react";

export default function ConfirmationConsole({ actions = [], onConfirm, onDecline }) {
  return (
    <AnimatePresence>
      {actions.map((action) => (
        <motion.div key={action.id}
          initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
          className="glass p-4 flex items-start gap-3"
          style={{ border: "1px solid rgba(255,179,71,0.25)", background: "rgba(255,179,71,0.04)" }}>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,179,71,0.15)", border: "1px solid rgba(255,179,71,0.25)" }}>
            <ShieldAlert size={15} style={{ color: "#FFB347" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold mb-1" style={{ color: "#FFB347" }}>Confirmation Required</div>
            <p className="text-xs leading-snug mb-3" style={{ color: "#BCC5E0" }}>{action.description}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => onConfirm?.(action.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: "rgba(35,209,139,0.12)", border: "1px solid rgba(35,209,139,0.22)", color: "#23D18B" }}>
                <Check size={11} /> Confirm
              </button>
              <button onClick={() => onDecline?.(action.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.2)", color: "#FF7070" }}>
                <X size={11} /> Decline
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
