import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
          50: '#EFF6FF',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
          ink: '#92400E',
        },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', ink: '#047857' },
        error: { DEFAULT: '#EF4444', light: '#FEE2E2', ink: '#B91C1C' },
        warning: '#F59E0B',
        fg: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
          2: '#F1F5F9',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.25)',
        pop: '0 8px 24px -6px rgba(15,23,42,0.12)',
      },
      keyframes: {
        sapulse: {
          '0%,100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0', transform: 'scale(1.05)' },
        },
      },
      animation: {
        sapulse: 'sapulse 1s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
