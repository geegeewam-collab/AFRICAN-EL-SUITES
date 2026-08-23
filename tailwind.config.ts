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
        ink: { DEFAULT: "#0B1526", raised: "#101F38" },
        riviera: { DEFAULT: "#26348C", light: "#4356B8", pale: "#DBE0F5" },
        brass: { DEFAULT: "#B8935A", light: "#D4B483", dark: "#8F7143" },
        linen: { DEFAULT: "#F6F1E6", raised: "#EFE7D6" },
        stone: "#8C8577",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "Helvetica Neue", "sans-serif"],
      },
      backgroundImage: {
        "brass-gradient": "linear-gradient(135deg, #B8935A 0%, #D4B483 50%, #8F7143 100%)",
        "riviera-gradient": "linear-gradient(180deg, #0B1526 0%, #26348C 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-in": "fadeIn 0.9s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
