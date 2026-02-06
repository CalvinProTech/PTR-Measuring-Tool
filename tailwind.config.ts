import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dfe8ff",
          200: "#b6c9ff",
          300: "#8ba8ff",
          400: "#5c82f2",
          500: "#3d5fe0",
          600: "#2a47c9",
          700: "#1e35a8",
          800: "#162980",
          900: "#0f1d5e",
          950: "#0a1340",
        },
        neutral: {
          50: "#f8f9fb",
          100: "#f1f3f6",
          200: "#e4e7ed",
          300: "#cdd2db",
          400: "#9ca3b4",
          500: "#6b7489",
          600: "#4a5268",
          700: "#353d52",
          800: "#232a3b",
          900: "#151a28",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px -1px rgba(15,23,42,0.06)",
        "card-hover":
          "0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04)",
        elevated:
          "0 8px 24px -4px rgba(15,23,42,0.12), 0 4px 8px -4px rgba(15,23,42,0.04)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-down": "slide-down 0.2s ease-out forwards",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
