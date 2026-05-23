/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F0E0C",
        bone: "#FAF8F5",
        terracotta: "#E8593C",
        sun: "#F2A623",
        sage: "#7BA77B",
        sand: "#C4B99A",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
