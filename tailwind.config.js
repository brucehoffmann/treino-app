/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        secondary: "var(--color-secondary)",
        "on-secondary": "var(--color-on-secondary)",
        border: "var(--color-border)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
      },
    },
  },
  plugins: [],
};
