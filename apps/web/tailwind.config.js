/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0F7640',
          forest: '#093322',
          amber: '#FEC10A',
          success: '#13A348',
          red: '#F83A20',
        },
      },
      borderRadius: {
        DEFAULT: '4px',
        none: '0px',
        sm: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        full: '4px', // STRICT USER RULE: Never 8px, 12px, or rounded-full; all rounded are strictly 4px
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 2px 5px -1px rgba(0, 0, 0, 0.07), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
        lg: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        xl: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xl': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        dropdown: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // STRICT: NO MONO FONT
      },
    },
  },
  plugins: [],
};
