/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: {
          primary: "#111827",
          secondary: "#1F2937",
        },
        border: "rgba(255,255,255,0.06)",
        text: {
          primary: "#E5E7EB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
        brand: "#6366F1",
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      borderRadius: {
        'brand': '8px',
      },
    },
  },
  plugins: [],
};

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Primary brand color (from your logo and active states)
//         primary: {
//           50: '#eff6ff',
//           100: '#dbeafe',
//           200: '#bfdbfe',
//           300: '#93c5fd',
//           400: '#60a5fa',
//           500: '#3b82f6',  // Your main blue-600
//           600: '#2563eb',
//           700: '#1d4ed8',
//           800: '#1e40af',
//           900: '#1e3a8a',
//         },
//         // Secondary accent (for highlights, badges)
//         secondary: {
//           50: '#f0fdf4',
//           100: '#dcfce7',
//           200: '#bbf7d0',
//           300: '#86efac',
//           400: '#4ade80',
//           500: '#22c55e',
//           600: '#16a34a',
//           700: '#15803d',
//         },
//         // Danger/warning colors
//         danger: {
//           50: '#fef2f2',
//           100: '#fee2e2',
//           500: '#ef4444',
//           600: '#dc2626',
//           700: '#b91c1c',
//         },
//         warning: {
//           50: '#fefce8',
//           100: '#fef9c3',
//           500: '#eab308',
//           600: '#ca8a04',
//         },
//       },
//       fontFamily: {
//         'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
//         'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
//       },
//       fontSize: {
//         'xxs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px
//       },
//       animation: {
//         'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
//       },
//     },
//   },
//   plugins: [],
// }