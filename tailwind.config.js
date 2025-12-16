/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          dark: "#1e40af",
          light: "#60a5fa",
        },
        slate: {
          DEFAULT: "#475569",
          dark: "#1e293b",
          light: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
