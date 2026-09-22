import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        navy: {
          950: "#060818",
          900: "#090C22",
          850: "#0D112D",
          800: "#12173B",
          700: "#1B2252",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          purple: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 12px 24px -6px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 16px 36px -8px rgba(99, 102, 241, 0.12), 0 4px 14px -2px rgba(15, 23, 42, 0.04)",
        glow: "0 0 24px -4px rgba(99, 102, 241, 0.35)",
        "glow-purple": "0 0 24px -4px rgba(139, 92, 246, 0.4)",
        lift: "0 12px 32px rgba(0,0,0,0.12)",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.45" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        scan: {
          "0%": { top: "8%" },
          "100%": { top: "88%" },
        },
        boxEntrance: {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.97)" },
          "60%": { opacity: "0.9", transform: "translateY(-2px) scale(1.005)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        shine: "shine 1.1s ease-in-out",
        pulseRing: "pulseRing 1.6s ease-out infinite",
        float: "float 3.2s ease-in-out infinite",
        scan: "scan 2.2s ease-in-out infinite alternate",
        boxEntrance: "boxEntrance 0.65s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
