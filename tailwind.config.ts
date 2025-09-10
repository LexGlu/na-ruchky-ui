import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimal custom colors actually in use
        brand: {
          lime: "#CCF28C",
          black: "#000000",
        },
      },
      maxWidth: {
        site: "1440px",
        content: "1336px",
      },
    },
  },
  plugins: [],
} satisfies Config;
