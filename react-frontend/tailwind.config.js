/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        // Jira primary
        primary: {
          DEFAULT: '#0052CC',
          light: '#4C9AFF',
          dark: '#0747A6',
        },
        navy: {
          DEFAULT: '#172B4D',
          light: '#253858',
        },
        secondary: {
          DEFAULT: '#00875A',
          light: '#36B37E',
        },
        // Backgrounds
        bg: '#F4F5F7',
        card: '#FFFFFF',
        surface: '#EBECF0',
        // Text
        ink: {
          DEFAULT: '#000000',
          secondary: '#333333',
          light: '#666666',
        },
        divider: '#DFE1E6',
        error: '#DE350B',
        warning: '#FF991F',
        info: '#0065FF',
        // Status
        todo: '#97A0AF',
        progress: '#0065FF',
        progressOrange: '#FF991F',
        done: '#00875A',
        review: '#800000',
        // Priority
        priorityHighest: '#CD1316',
        priorityHigh: '#E97F33',
        priorityMedium: '#FFAB00',
        priorityLow: '#0065FF',
        priorityLowest: '#57D9A3',
      },
      borderRadius: {
        jira: '4px',
        'jira-lg': '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(9,30,66,0.12)',
        kanban: '0 2px 4px rgba(9,30,66,0.08)',
      },
    },
  },
  plugins: [],
};
