import { useEffect, useState } from "react";
import { motion } from "motion/react";
import AegisLogo from "./AegisLogo";

const LINES = [
  { text: "Initializing Aegis Incident Commander…",       delay: 0   },
  { text: "Connecting to Agora Conversational AI…",       delay: 420 },
  { text: "Loading Deepgram STT / MiniMax TTS pipeline…", delay: 840 },
  { text: "Preparing incident classification engine…",    delay: 1200 },
  { text: "All systems nominal.",                         delay: 1600 },
];

export default function BootSequence({ onDone }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    let t;
    const step = (i) => {
      if (i >= LINES.length) { setDone(true); return; }
      t = setTimeout(() => { setVisible(i + 1); step(i + 1); }, 150);
    };
    step(0);

    // Hard fallback guard: transition to main app in max 1500ms
    const fallbackTimer = setTimeout(() => {
      onDone?.();
    }, 1500);

    return () => {
      clearTimeout(t);
      clearTimeout(fallbackTimer);
    };
  }, [onDone]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-screen flex flex-col items-center justify-center gap-10"
      style={{ background: "#06080F" }}>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="relative flex flex-col items-center justify-center">
        <div className="p-4 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(99, 102, 241, 0.3)", boxShadow: "0 0 60px rgba(99, 102, 241, 0.35), 0 0 120px rgba(56, 189, 248, 0.15)" }}>
          <AegisLogo collapsed size="large" />
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-[-16px] rounded-full border anim-orb-ring pointer-events-none"
          style={{ borderColor: "rgba(99, 102, 241, 0.3)" }} />
      </motion.div>

      <div>
        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#E8EDF8" }}>Aegis</h1>
        <p className="text-sm text-center" style={{ color: "#3A4060" }}>AI Incident Commander · Powered by Agora</p>
      </div>

      {/* Boot lines */}
      <div className="w-72 space-y-2">
        {LINES.slice(0, visible).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5">
            <span style={{ color: "#7C60FF", fontFamily: "monospace" }}>›</span>
            <span className="text-xs font-mono" style={{ color: i === visible - 1 ? "#A898FF" : "#3A4060" }}>
              {line.text}
            </span>
            {i === visible - 1 && i < LINES.length - 1 && (
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                className="text-xs font-mono" style={{ color: "#7C60FF" }}>▌</motion.span>
            )}
            {i < visible - 1 && (
              <span className="ml-auto text-[10px] font-mono" style={{ color: "#22D38C" }}>✓</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
