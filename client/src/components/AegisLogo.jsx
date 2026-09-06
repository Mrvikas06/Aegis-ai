import React from "react";
import { motion } from "motion/react";

export default function AegisLogo({ collapsed = false, size = "normal" }) {
  const isSmall = size === "small";
  const isLarge = size === "large";

  const iconWidth = isLarge ? "48" : isSmall ? "34" : "40";
  const iconHeight = isLarge ? "48" : isSmall ? "34" : "40";

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* High-Tech Aegis Emblem */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex items-center justify-center shrink-0"
      >
        {/* Soft Ambient Holographic Energy Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 opacity-25 blur-md group-hover:opacity-75 group-hover:blur-lg transition-all duration-500 pointer-events-none" />

        <svg
          width={iconWidth}
          height={iconHeight}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 filter drop-shadow-[0_4px_16px_rgba(99,102,241,0.45)]"
        >
          <defs>
            {/* Dark Cyber Obsidian Gradient */}
            <linearGradient id="cyberBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0B0F19" />
            </linearGradient>

            {/* Radiant Cyber Neon Gradient for Primary Geometry */}
            <linearGradient id="neonPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>

            {/* Glowing Accent Gradient */}
            <linearGradient id="cyanAccent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Core Reactor Pulse Glow */}
            <radialGradient id="reactorCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
              <stop offset="60%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hexagonal Futuristic Outer Shield Container */}
          <polygon
            points="50,4 90,25 90,75 50,96 10,75 10,25"
            fill="url(#cyberBase)"
            stroke="url(#neonPrimary)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Facet Inset Line */}
          <polygon
            points="50,12 82,29 82,71 50,88 18,71 18,29"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Stylized Modern 'A' Aegis Wings */}
          {/* Left Wing */}
          <path
            d="M50 20 L26 68 L36 68 L50 38 L64 68 L74 68 Z"
            fill="url(#neonPrimary)"
            opacity="0.95"
          />

          {/* Right Wing Accent Layer */}
          <path
            d="M50 20 L64 68 L54 68 L50 38 Z"
            fill="url(#cyanAccent)"
            opacity="0.8"
          />

          {/* Crossbar Energy Node */}
          <path
            d="M34 54 H66 L50 42 Z"
            fill="url(#cyanAccent)"
            opacity="0.9"
          />

          {/* Central Reactor Core Pulse Diamond */}
          <polygon
            points="50,46 57,56 50,66 43,56"
            fill="url(#reactorCore)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />

          {/* High-Tech Tech Corner Markers */}
          <circle cx="50" cy="4" r="2.5" fill="#38BDF8" />
          <circle cx="90" cy="25" r="2" fill="#6366F1" />
          <circle cx="10" cy="25" r="2" fill="#6366F1" />
        </svg>
      </motion.div>

      {/* Typography Text Section */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-[0.18em] text-white font-sans uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
              AEGIS
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              AI COMMAND
            </span>
          </div>
          <div className="text-[10px] font-mono font-semibold text-cyan-400/90 tracking-[0.22em] uppercase mt-1">
            INCIDENT COPILOT
          </div>
        </div>
      )}
    </div>
  );
}

