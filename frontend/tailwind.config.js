/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PharmaGuard design tokens
        void: '#020408',
        deep: '#060d14',
        surface: '#0a1520',
        card: '#0d1e2e',
        teal: {
          DEFAULT: '#00c8aa',
          dim: 'rgba(0, 200, 170, 0.15)',
          glow: 'rgba(0, 200, 170, 0.4)',
        },
        safe: '#00e676',
        adjust: '#ffab40',
        toxic: '#ff1744',
        ineffective: '#aa00ff',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease forwards',
        'fade-in': 'fade-in 0.5s ease forwards',
        'spin-slow': 'spin-slow 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blink': 'blink 0.8s step-end infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 200, 170, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 200, 170, 0.6), 0 0 50px rgba(0, 200, 170, 0.2)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}