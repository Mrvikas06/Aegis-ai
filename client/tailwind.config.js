/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep Space Dark Palette
        bg: "#090B12",
        surface: "#111420",
        surface2: "#181C2A",
        surface3: "#1E2338",
        surfaceActive: "rgba(120,100,255,0.12)",
        ink: "#EDF0F8",
        muted: "#8892B0",
        faint: "#4A5280",
        edge: "rgba(255,255,255,0.07)",
        edge2: "rgba(255,255,255,0.12)",

        // Electric Violet AI
        ai: "#7C6FFF",
        primary: "#7C6FFF",
        "primary-hover": "#9B8FFF",
        "ai-blue": "#4FC3F7",
        "ai-cyan": "#00E5FF",
        "ai-glow": "rgba(124,111,255,0.35)",

        // Amber severity
        sev1: "#FF4D4D",
        sev2: "#FFB347",
        amber: "#FFB347",

        // Status
        green: "#23D18B",
        red: "#FF4D4D",
        mint: "#1DE9B6",
        "mint-bg": "rgba(29,233,182,0.08)",
        "mint-dark": "#00BFA5",
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "16px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "22px",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        card: "0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.5)",
        glow: "0 0 40px rgba(124,111,255,0.4), 0 0 80px rgba(124,111,255,0.15)",
        "glow-amber": "0 0 30px rgba(255,179,71,0.3)",
        "glow-red": "0 0 30px rgba(255,77,77,0.3)",
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        orbPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.15)", opacity: "0.4" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
      },
      animation: {
        orbPulse: "orbPulse 3s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        breathe: "breathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
