import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f0f',
        card: '#181818',
        soft: '#2a2a2a',
      },
      borderRadius: {
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
} satisfies Config
