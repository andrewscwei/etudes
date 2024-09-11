/* eslint-disable @typescript-eslint/no-require-imports */

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
      transparent: 'transparent',
      dark: '#3f3b38',
      light: '#a9a293',
    },
    fontFamily: {
      sans: ['Roboto Mono', 'sans-serif'],
    },
    fontSize: {
      base: '.8rem',
      sm: '.7rem',
      xs: '.6rem',
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
      addVariant('selected', '&.selected')
      addVariant('disabled', '&.disabled')
      addVariant('dragging', '&.dragging')
      addVariant('svg', '& svg')
      addVariant('svg*', '& svg *')
    },
  ],
} as Config
