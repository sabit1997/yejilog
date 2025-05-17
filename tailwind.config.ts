import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        eulyoo: ["var(--font-eulyoo)", "sans-serif"],
        concon: ["var(--font-concon)", "sans-serif"],
        partial: ["var(--font-partial)", "sans-serif"],
        pretendard: ["var(--font-pretendard)", "sans-serif"],
      },
    },
  },

  plugins: [typography],
};

export default config;
