import path from 'node:path'

export default {
  content: [
    path.join(__dirname, 'src/**/*.{ts,tsx,html}'),
    path.join(__dirname, 'index.html'),
  ],
  theme: {
    screens: {
      tab: '640px',
      note: '1025px',
      desk: '1440px',
    },
    colors: {
      white: '#fff',
      green: '#3e4827',
      blue: '#344c64',
      gold: '#bba980',
      red: '#ff6d70',
      grey: '#25282a',
      lightGrey: '#f2f2f2',
      black: '#0f0f0f',
    },
    fontFamily: {
      sans: ['Museo', 'sans-serif'],
    },
    extend: {
      fontSize: {
        '3xs': '1.1rem',
        '2xs': '1.2rem',
        'xs': '1.3rem',
        'sm': '1.4rem',
        'base': '1.6rem',
        'lg': '1.8rem',
        'xl': '2rem',
        '2xl': '2.4rem',
        '3xl': '3rem',
        '4xl': '3.6rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      zIndex: {
        widgets: '10',
        nav: '20',
        overlays: '50',
      },
    },
  },
}
