import path from 'node:path'
import type { Config } from 'tailwindcss'

export default {
  content: [
    path.join(__dirname, 'src/**/*.{ts,tsx,html}'),
    path.join(__dirname, 'src/**/*.html'),
  ],
  theme: {
    screens: {
      tab: '640px',
      note: '1025px',
    },
    colors: {
      white: '#fff',
      black: '#3f3b38',
      bg: '#a9a293',
    },
    fontFamily: {
      sans: ['Roboto Mono', 'sans-serif'],
    },
    fontSize: {
      sm: '.7rem',
      md: '.8rem',
      lg: '1.1rem',
    },
    extend: {
      transitionDuration: {
        DEFAULT: '200ms',
      },
      animation: {
        fade: 'fade 1000ms both ease-in-out',
      },
      keyframes: theme => ({
        fade: {
          '0%': {
            opacity: '0%',
            transform: 'translateY(100%)',
          },
          '25%': {
            opacity: '100%',
            transform: 'translateY(0)',
          },
          '75%': {
            opacity: '100%',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0%',
            transform: 'translateY(100%)',
          },
        },
      }),
    },
  },
  plugins: [
    require('tailwindcss-safe-area'),
    function ({ addVariant }) {
      addVariant('active', '&.active')
      addVariant('disabled', '&.disabled')
      addVariant('svg', '& svg')
      addVariant('svg*', '& svg *')
    },
  ],
} as Config
