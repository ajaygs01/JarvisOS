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
          bg: '#050814',
          surface: '#0B132B',
          card: '#0F1A36',
          border: '#1E293B',
          borderGlow: '#00F0FF33',
          cyan: '#00F0FF',
          cyanGlow: '#00F0FF66',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          textMuted: '#94A3B8',
          textBright: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px -3px rgba(0, 240, 255, 0.3), 0 0 6px -2px rgba(0, 240, 255, 0.2)',
        'cyan-glow-lg': '0 0 25px -2px rgba(0, 240, 255, 0.4), 0 0 10px -2px rgba(0, 240, 255, 0.3)',
        'violet-glow': '0 0 15px -3px rgba(139, 92, 246, 0.3)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
}
