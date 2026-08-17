/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // DESIGN.md: black/white palette only
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        gray: {
          subtle: '#6B7280',   // subtext / captions
          border: '#E5E7EB',   // card borders
        },
      },
      // DESIGN.md: Inter for headlines + body; Georgia/serif for italic accent word
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      // Generous pill border-radius
      borderRadius: {
        pill: '9999px',
        card: '1rem',   // ~16px, per DESIGN.md card spec
      },
    },
  },
  plugins: [],
}
