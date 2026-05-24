/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Always-dark anchors (landing, hero cards). Constants.
        ink: "#0F0E0C",
        bone: "#FAF8F5",
        // Accents — same on both themes.
        terracotta: "#E8593C",
        sun: "#F2A623",
        sage: "#7BA77B",
        sand: "#C4B99A",
        // Semantic theme-aware tokens — driven by CSS variables in globals.css.
        // Use these for any surface that should respond to theme.
        page: "rgb(var(--c-page) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        "card-soft": "rgb(var(--c-card-soft) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        "fg-muted": "rgb(var(--c-fg-muted) / <alpha-value>)",
        "fg-faint": "rgb(var(--c-fg-faint) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-soft": "rgb(var(--c-line-soft) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
