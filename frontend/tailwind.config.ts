import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#010B40',
          foreground: '#FFFFFF',
          50: '#E6E8F0',
          100: '#CDD1E0',
          200: '#9BA3C1',
          300: '#6975A3',
          400: '#374784',
          500: '#010B40',
          600: '#010933',
          700: '#010726',
          800: '#000419',
          900: '#00020D',
        },
        secondary: {
          DEFAULT: '#F13544',
          foreground: '#FFFFFF',
          50: '#FDE6E8',
          100: '#FCCDD1',
          200: '#F99BA3',
          300: '#F66974',
          400: '#F43746',
          500: '#F13544',
          600: '#C12A36',
          700: '#912029',
          800: '#61151B',
          900: '#300B0E',
        },
        accent: {
          DEFAULT: '#F13544',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
        'century-gothic': ['"Century Gothic"', 'sans-serif'],
        'dry-brush': ['"Dry Brush"', 'cursive'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;