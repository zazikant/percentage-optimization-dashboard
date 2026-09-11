import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        easy: "#22c55e",
        medium: "#f59e0b",
        hard: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
