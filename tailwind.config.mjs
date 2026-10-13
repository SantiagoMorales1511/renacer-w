/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,ts,tsx,mjs}'],
  theme: {
    extend: {
      colors: {
        // ── Sitio público (Manual de Identidad Renacer) ──
        ink: { DEFAULT: '#1B2B45', soft: '#3A4A63', mute: '#5E6B80' },
        petrol: { DEFAULT: '#2F4D7E', deep: '#1F3A63', night: '#14243D' },
        lavender: { DEFAULT: '#C8B6E6', soft: '#E9E1F5', deep: '#A992D8' },
        peri: '#D9DDF7',
        cream: { DEFAULT: '#F7F6F3', warm: '#F1EDE6', line: '#E4DED4' },
        gold: { DEFAULT: '#D7C29A', deep: '#9C7F4B' },
        sage: '#BFD9C4',
        wa: { DEFAULT: '#1F7A4D', hover: '#196640' },
        // ── Tokens heredados: los usan los paneles /admin/* ──
        primary: { DEFAULT: '#a78bfa', light: '#c4b5fd' },
        accent: { DEFAULT: '#6ee7b7', light: '#a7f3d0' },
        surface: { DEFAULT: '#ffffff', soft: '#f8fafc' },
        text: { DEFAULT: '#1f2937', muted: '#6b7280' },
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        admin: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '14px', '4xl': '2rem' },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0,0,0,0.04)',
        soft: '0 1px 2px rgba(20,36,61,.04), 0 8px 24px -12px rgba(20,36,61,.12)',
        lift: '0 2px 4px rgba(20,36,61,.04), 0 24px 48px -24px rgba(20,36,61,.28)',
      },
      maxWidth: { prose: '62ch' },
    },
  },
  plugins: [],
}
