/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        obsidian: '#09090B',
        card: '#141417',
        pill: '#1C1C20',
        dock: '#18181C',
        forest: {
          bg: '#14331C',
          muted: '#9BC4A5',
        },
        indigo: {
          squircle: '#282249',
          accent: '#A594F9',
        },
        teal: {
          squircle: '#1A313D',
          accent: '#67E8F9',
        },
        semantic: {
          emerald: '#4ADE80',
          coral: '#F87171',
          amber: '#F28B66',
        },
      },
    },
  },
  plugins: [],
};
