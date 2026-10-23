/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Cinzel: letras de inscripcion clasica para titulos. Montserrat: cuerpo y detalles.
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        // Paleta platinada: obsidiana, platino y acero.
        black: '#0A0A0B', // base (obsidiana)
        white: '#ECEDEF', // primario (platino claro)
        gray: {
          50: '#F5F6F7',
          100: '#E9EAEC',
          200: '#D6D8DB',
          300: '#C4C7CC', // texto neutro
          400: '#9DA1A8',
          500: '#80848C', // secundario (acero)
          600: '#5A5E66',
          700: '#3E4147',
          800: '#2A2C30',
          850: '#202226',
          900: '#17181B',
          950: '#0F1012',
        },
        platinum: {
          200: '#F2F3F5',
          300: '#DCDEE2',
          400: '#C5C8CE',
          500: '#AEB2BA', // acento (platino)
          600: '#8A8F98',
          900: '#2B2D31',
        },
      },
    },
  },
  plugins: [],
};
