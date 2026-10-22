/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        gray: {
          850: '#1f2937',
          950: '#030712',
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
