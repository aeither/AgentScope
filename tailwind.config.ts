import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF1A1A",
        "primary-hover": "#FF4D4D",
        "primary-active": "#CC1414",
        background: "#0A0A0A",
        "glass-bg": "rgba(15, 15, 20, 0.75)",
        "glass-overlay": "rgba(255, 26, 26, 0.15)",
        "glass-tint": "rgba(255, 26, 26, 0.25)",
        "text-primary": "#FFFFFF",
        "text-secondary": "#B0B0B0",
        "border-glow": "rgba(255, 26, 26, 0.5)",
        success: "#00FF88",
        warning: "#FFD700",
      },
    },
  },
  plugins: [],
};

export default config;

