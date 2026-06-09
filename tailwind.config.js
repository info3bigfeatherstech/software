/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      app: "0",
      full: "0",
    },
    extend: {
      colors: {
        app: {
          bg: "#f0f2f5",
          surface: "#ffffff",
          border: "#d1d5db",
          "border-light": "#e5e7eb",
          text: "#1f2937",
          "text-secondary": "#4b5563",
          "text-muted": "#6b7280",
          accent: "#2563eb",
          "accent-hover": "#1d4ed8",
          "accent-light": "#eff6ff",
          sidebar: "#ffffff",
          "sidebar-active": "#eff6ff",
          header: "#ffffff",
          success: "#15803d",
          warning: "#b45309",
          danger: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "Segoe UI", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      fontSize: {
        xxs: ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        app: "0 1px 2px rgba(0, 0, 0, 0.06)",
        "app-md": "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
