
const colors = require('tailwindcss/colors')
module.exports = {
   purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
      screens: {
        '2xl': {'max': '1535px'},
        // => @media (max-width: 1535px) { ... }
  
        'xl': {'max': '1279px'},
        // => @media (max-width: 1279px) { ... }
  
        'lg': {'max': '1023px'},
        // => @media (max-width: 1023px) { ... }
  
        'md': {'max': '767px'},
        // => @media (max-width: 767px) { ... }
  
        'sm': {'max': '639px'},
        // => @media (max-width: 639px) { ... }
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif']
      },
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
          'kobe-hof-shoes': `url('${process.env.REACT_APP_DEV_URL}/images/kobes.jpeg')`,
          'lebron-south-beach-shoes': `url('${process.env.REACT_APP_DEV_URL}/images/lebrons.jpeg')`,
          'jordan-trophy-room-shoes': `url('${process.env.REACT_APP_DEV_URL}/images/jordans.jpeg')`,
        },
        colors: {
          brown: {
            '500': '#975A16'
          },
          lakersGold: {
            '100': '#f8e1b0',
            '200': '#f8ca68',
            '500': '#F5B327'
          }
        },
        height: {
          '50': '50px',
          '100': '100px',
          '150': '150px',
          '160': '160px',
          '200': '200px',
          '250': '250px',
          '300': '300px',
          '350': '350px',
          '400': '400px',
          '450': '450px',
          '500': '500px',
          '600': '600px',
          '700': '700px',
          '800': '800px',
          '900': '900px',
          '1000': '1000px'
        },
        width: {
          '50': '50px',
          '100': '100px',
          '150': '150px',
          '234': '234px',
          '200': '200px',
          '300': '300px',
          '400': '400px',
          '500': '500px',
          '600': '600px',
          '700': '700px',
          '800': '800px',
          '900': '900px',
          '1000': '1000px',
          '97/100': '97%',
          '12/100': '12%',
          '14/100': '14%'
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