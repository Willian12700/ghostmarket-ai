/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        panel: '#111111',
        panelHover: '#171717',
        border: '#27272A',
        borderHover: '#334155',
        textPrimary: '#F3F4F6',
        textSecondary: '#9CA3AF',
        primary: 'var(--color-primary, #8B5CF6)',
        primaryLight: 'var(--color-primary-light, #A855F7)',
        secondary: 'var(--color-secondary, #EC4899)', // Pink
        accent: 'var(--color-accent, #D946EF)', // Fuchsia
        success: '#22C55E',
        error: '#EF4444',
      }
    },
  },
  plugins: [],
}
