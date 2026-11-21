/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kraft: {
          50: '#faf7f2',
          100: '#f4ece1',
          200: '#e8d7c1',
          300: '#d9be9c',
          400: '#c79f72',
          500: '#b4814d',
          600: '#9b683d',
          700: '#7c5032',
          800: '#66422c',
          900: '#553727',
          950: '#301c13',
        },
        charcoal: {
          50: '#f6f6f7',
          100: '#ececed',
          200: '#d6d7d9',
          300: '#b3b5b9',
          400: '#898c93',
          500: '#6a6d75',
          600: '#55575e',
          700: '#46474d',
          800: '#3b3c41',
          900: '#18191b',
          950: '#0f1011',
        },
        brand: {
          forest: '#1b3a2e',
          sage: '#446857',
          amber: '#c97a2c',
          paper: '#f8f6f0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'craft': '0 4px 20px -2px rgba(27, 28, 30, 0.08), 0 2px 6px -1px rgba(27, 28, 30, 0.04)',
        'craft-hover': '0 10px 25px -4px rgba(27, 28, 30, 0.12), 0 4px 10px -2px rgba(27, 28, 30, 0.06)',
      }
    },
  },
  plugins: [],
}
