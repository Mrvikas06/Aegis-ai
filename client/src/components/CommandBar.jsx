import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";

export default function CommandBar({ open, onClose, onCommand }) {
  const [query, setQuery] = useState("");
  const CMDS = [
    { label: "Run Tech Demo", action: () => onCommand?.("demo:tech") },
    { label: "Run Pitch Demo", action: () => onCommand?.("demo:pitch") },
    { label: "Request Catch-up", action: () => onCommand?.("catchup") },
    { label: "Export Summary", action: () => onCommand?.("export") },
    { label: "Close Incident", action: () => onCommand?.("close") },
  ];
  const filtered = CMDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-6"
          style={{ background: "rgba(9,11,18,0.8)", backdropFilter: "blur(8px)" }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -8 }}
            className="glass w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Search size={14} style={{ color: "#4A5280" }} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#EDF0F8" }} />
              <button onClick={onClose}><X size={14} style={{ color: "#4A5280" }} /></button>
            </div>
            <div className="p-2">
              {filtered.map((c, i) => (
                <button key={i} onClick={() => { c.action(); onClose(); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all"
                  style={{ color: "#BCC5E0" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(124,111,255,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
