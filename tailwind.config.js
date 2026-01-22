/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          active: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        accent: '#06B6D4',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        bg: {
          primary: '#0F0F1A',
          secondary: '#1A1A2E',
          tertiary: '#252542',
        },
        surface: {
          DEFAULT: '#1E1E32',
          hover: '#2A2A45',
        },
        border: {
          DEFAULT: '#3D3D5C',
          focus: '#8B5CF6',
        },
        risk: {
          safe: '#10B981',
          medium: '#F59E0B',
          degen: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'button': '10px',
      },
      animation: {
        'pulse-green': 'pulse-green 0.3s ease-out',
        'pulse-red': 'pulse-red 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(16, 185, 129, 0.3)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(239, 68, 68, 0.3)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
