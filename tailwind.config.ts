import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        easy: "#000000",
        medium: "#000000",
        hard: "#000000",
      },
    },
  },
  plugins: [],
};

export default config;
