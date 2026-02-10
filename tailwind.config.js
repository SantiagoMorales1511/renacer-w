/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a78bfa',
          light: '#c4b5fd',
        },
        accent: {
          DEFAULT: '#6ee7b7',
          light: '#a7f3d0',
        },
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
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
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


