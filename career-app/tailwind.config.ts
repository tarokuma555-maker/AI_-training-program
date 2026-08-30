import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#12303D",
        accent: "#E8833A",
        teal: "#1C7293",
        mist: "#EFF4F6",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "Hiragino Sans", "Meiryo", "sans-serif"],
        chalk: ["var(--font-chalk)", "var(--font-noto-sans-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
