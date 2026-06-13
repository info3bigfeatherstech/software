/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    borderRadius: {
      none: "0px",
      sm: "4px",
      DEFAULT: "6px",
      md: "8px",
      lg: "10px",
      xl: "12px",
      "2xl": "16px",
      "3xl": "24px",
      app: "6px",
      full: "9999px",
    },
    extend: {
      colors: {
        app: {
          bg: 'var(--color-app-bg)',
          sidebar: 'var(--color-app-sidebar)',
          accent: 'var(--color-app-accent)',
          'accent-hover': 'var(--color-app-accent-hover)',
          'accent-light': 'var(--color-app-accent-light)',
          surface: "#ffffff",
          border: "#d1d5db",
          "border-light": "#e5e7eb",
          text: "#1f2937",
          "text-secondary": "#4b5563",
          "text-muted": "#6b7280",
          header: "#ffffff",
          success: "#15803d",
          warning: "#b45309",
          danger: "#b91c1c",
        },
        blue: {
          600: 'var(--color-app-accent)',
          700: 'var(--color-app-accent-hover)',
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      fontSize: {
        xxs: ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        app: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "app-md": "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
