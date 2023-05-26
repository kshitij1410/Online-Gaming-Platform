/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
],
  theme: {
    extend: {
      backgroundImage:theme =>({
        'background-image':"url('/images/bg.jpg')",
        'logo':"url('/images/logo.jpg')",
        'home-background':"url('/images/home-bg.jpg')",
        'rupee':"url('/images/rupee.png')",
        'loader':"url('/images/ecllipse.gif')",
        'prize':"url('/images/price.gif')",
        'prize1':"url('/images/prize1.gif')"
        
      }),
      colors: {
        tr_color: '#ddd',
      }
    },
  },
  plugins: [],
}

