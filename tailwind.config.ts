import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        brutal: "8px 8px 0 #111111",
        "brutal-sm": "4px 4px 0 #111111",
      },
    },
  },
  plugins: [],
};

export default config;
