import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070707",
        coal: "#0E0E0E",
        graphite: "#151515",
        steel: "#1D1D1D",
        line: "rgba(255,255,255,0.09)",
        mute: "#8A8A85",
        bone: "#EDEAE3",
        gold: {
          DEFAULT: "#F4B126",
          soft: "#FFD27A",
          deep: "#B07D14",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { site: "1320px" },
      transitionTimingFunction: { out: "cubic-bezier(.2,.7,.2,1)" },
    },
  },
  plugins: [],
} satisfies Config;
