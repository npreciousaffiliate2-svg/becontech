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
          blue: '#0A77FE',
          amber: '#FEC10A',
          green: '#13A348',
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
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        md: '0 2px 5px -1px rgba(0, 0, 0, 0.07), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
        lg: '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        xl: '0 8px 14px -3px rgba(0, 0, 0, 0.09), 0 3px 6px -2px rgba(0, 0, 0, 0.04)',
        '2xl': '0 12px 20px -4px rgba(0, 0, 0, 0.1)',
        // Google Docs Menu Dropdown Shadow: tight, crisp, zero blurry spill
        dropdown: '0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], // STRICT: NO MONO FONT
      },
    },
  },
  plugins: [],
};
