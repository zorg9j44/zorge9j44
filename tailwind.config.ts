import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121116",
        surface: "#1B1A22",
        "surface-hover": "#232230",
        border: "#2C2A38",
        foreground: "#F5F3F7",
        muted: "#9B96A8",
        accent: {
          DEFAULT: "#8B5CF6",
          light: "#C084FC",
          dark: "#6D28D9",
        },
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #C084FC 0%, #6D28D9 100%)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
