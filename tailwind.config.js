/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f8fafc',
        },
        text: {
          DEFAULT: '#1f2937',
          muted: '#6b7280',
        },
        border: '#e5e7eb',
      },
      borderRadius: {
        'xl': '14px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}


