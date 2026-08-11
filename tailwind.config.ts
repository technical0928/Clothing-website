import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#fff7e0",
          100: "#fdefcd",
          200: "#f8dd99",
          300: "#f1c562",
          400: "#e7ac2b",
          500: "#d18f1b",
          600: "#a56f14",
          700: "#764f0f",
          800: "#50340a",
          900: "#322209",
        },
        cream: "#fdf4e6",
        gold: "#d18f1b",
        brown: "#453227",
        charcoal: "#1f1a17",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-display)", "ui-serif", "Georgia"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms"), require("daisyui")],
};
export default config;
