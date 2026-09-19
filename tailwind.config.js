/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-bg, #0A0A0A)',
        panel: 'var(--color-panel, #111111)',
        panelHover: 'var(--color-panel-hover, #171717)',
        border: 'var(--color-border, #27272A)',
        borderHover: 'var(--color-border-hover, #334155)',
        textPrimary: 'var(--color-text-primary, #F3F4F6)',
        textSecondary: 'var(--color-text-secondary, #9CA3AF)',
        primary: 'var(--color-primary, #8B5CF6)',
        primaryLight: 'var(--color-primary-light, #A855F7)',
        secondary: 'var(--color-secondary, #EC4899)',
        accent: 'var(--color-accent, #D946EF)',
        success: '#22C55E',
        error: '#EF4444',
      }
    },
  },
  plugins: [],
}
