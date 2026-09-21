/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7FAFF',
        'paper-warm': '#FFFFFF',
        ink: '#16233F',
        'ink-soft': '#5B6780',
        'ink-faint': '#93A0B8',
        blue: '#2C5FF6',
        'blue-deep': '#1B40B8',
        'blue-wash': '#E8EFFE',
        pen: '#D93A2B',
        'pen-soft': '#FBE7E4',
        green: '#1F9D63',
        mark: '#FFE59B',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        pen: ['"Caveat"', 'cursive'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1180px',
      },
    },
  },
  plugins: [],
};
