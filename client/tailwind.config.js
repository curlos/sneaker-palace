
const colors = require('tailwindcss/colors')
module.exports = {
   purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
      flex: {
        '2': '2',
        '3': '3',
        '4': '4',
        '6': '6',
        '8': '8',
        '10': '10'
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: "#000",
        white: "#fff",
        bluegray: colors.blueGray,
        coolgray: colors.coolGray,
        gray: colors.gray,
        truegray: colors.trueGray,
        warmgray: colors.warmGray,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        lightblue: colors.sky,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,
      },
      extend: {
        backgroundImage: {
          'login-image': "url('https://i.pinimg.com/originals/a1/b6/80/a1b68042f24f520d7a1e505bde40a24a.jpg')",
          'kobe-hof-shoes': "url('http://localhost:8888/assets/kobes.jpeg')",
        },
        colors: {
          brown: {
            '500': '#975A16'
          }
        },
        height: {
          '150': '150px',
          '160': '160px'
        },
        width: {
          '150': '150px',
          '234': '234px'
        }
      }
    },
    variants: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/forms'), // import tailwind forms
   ],
  }