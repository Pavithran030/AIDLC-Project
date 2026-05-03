import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          50:  '#fdfaf4',
          100: '#f8f2e4',
          200: '#f0e6cc',
          300: '#e4d4b0',
          DEFAULT: '#f5f0e8',
        },
        ink: {
          DEFAULT: '#2c1a0e',
          light: '#5c3d2e',
          muted: '#8b6f5e',
        },
        todo:     { DEFAULT: '#c0392b', light: '#fdecea' },
        progress: { DEFAULT: '#b7860b', light: '#fef9e7' },
        done:     { DEFAULT: '#1e7e34', light: '#eafaf1' },
      },
      boxShadow: {
        paper: '0 1px 3px rgba(44,26,14,0.12), 0 1px 2px rgba(44,26,14,0.08)',
        'paper-lift': '0 8px 24px rgba(44,26,14,0.18), 0 2px 8px rgba(44,26,14,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
