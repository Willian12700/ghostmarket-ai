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
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        backgroundSecondary: 'var(--background-secondary)',
        surface: 'var(--surface)',
        surfaceElevated: 'var(--surface-elevated)',
        border: 'var(--border)',
        borderHover: 'var(--border-hover)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        error: 'var(--error)',
        // Keeping legacy colors that might be used elsewhere to avoid breaking changes, mapped to new tokens
        panel: 'var(--surface)',
        panelHover: 'var(--surface-elevated)',
        primary: 'var(--accent)',
        primaryLight: 'var(--accent)',
      },
      boxShadow: {
        'glow': '0 0 20px var(--accent-glow)',
        'glow-sm': '0 0 10px var(--accent-glow)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
