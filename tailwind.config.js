/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#0b0c10",
        "charcoal-dark": "#050608",
        crimson: "#8b0000",
        "crimson-bright": "#c81d25",
        maroon: "#4a0e17",
        "violet-dusk": "#2d1e36",
        "teal-haze": "#1a3836",
        "amber-glow": "#ffb347",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Open Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
        mono: [
          '"Courier New"',
          "ui-monospace",
          '"SFMono-Regular"',
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
