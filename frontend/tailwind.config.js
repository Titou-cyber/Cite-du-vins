/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'wine-red': '#722F37',
          'wine-burgundy': '#4E0707',
          'wine-gold': '#E6C17B',
          'wine-cream': '#F9F3E9',
          'wine-cork': '#BB9F7C',
          'wine-bottle': '#0F3327',
          'wine-rosé': '#F0CCD1',
          'wine-purple': '#5E2247',
        },
        fontFamily: {
          'serif': ['Playfair Display', 'serif'],
          'sans': ['Montserrat', 'sans-serif'],
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          'vineyard': "url('/images/vineyard-bg.jpg')",
          'citeduvin': "url('/images/cite-du-vin.jpg')",
        },
        animation: {
          'wine-pour': 'pour 3s ease-in-out infinite',
          'bubble': 'bubble 2s ease-in-out infinite',
        },
        keyframes: {
          pour: {
            '0%, 100%': { transform: 'rotate(-5deg)' },
            '50%': { transform: 'rotate(5deg)' },
          },
          bubble: {
            '0%': { transform: 'translateY(0)', opacity: '0' },
            '50%': { opacity: '1' },
            '100%': { transform: 'translateY(-20px)', opacity: '0' },
          },
        },
        borderRadius: {
          'wine-bottle': '0% 0% 40% 40% / 0% 0% 30% 30%',
        },
      },
    },
    plugins: [],
  }