import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1D4ED8",
          dark: "#1E3A8A",
          light: "#60A5FA",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-primary-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-primary-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 20px 25px -5px rgb(59 130 246 / 0.1), 0 10px 10px -5px rgb(59 130 246 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
