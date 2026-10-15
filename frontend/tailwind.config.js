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
        cyber: {
          bg: '#060709',
          surface: '#0D0E15',
          card: '#131520',
          border: '#2E1419',
          borderGlow: 'rgba(239, 68, 68, 0.35)',
          red: '#FF1E44',
          redGlow: 'rgba(255, 30, 68, 0.5)',
          gold: '#FFB800',
          goldGlow: 'rgba(255, 184, 0, 0.4)',
          cyan: '#00F0FF',
          cyanGlow: 'rgba(0, 240, 255, 0.4)',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          textMuted: '#94A3B8',
          textBright: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'red-glow': '0 0 15px -2px rgba(255, 30, 68, 0.5), 0 0 6px -1px rgba(255, 30, 68, 0.3)',
        'red-glow-lg': '0 0 25px -2px rgba(255, 30, 68, 0.6), 0 0 10px -2px rgba(255, 30, 68, 0.4)',
        'gold-glow': '0 0 15px -3px rgba(255, 184, 0, 0.45)',
        'cyan-glow': '0 0 15px -3px rgba(0, 240, 255, 0.35)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        arcPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'arc-pulse': 'arcPulse 2.5s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
}
