/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Medieval/Gothic theme colors
        'mafia': {
          dark: '#0a0603',
          wood: '#6b3410',
          gold: '#ffd700',
          blood: '#8b0000',
          text: '#e8d4b8',
          'wood-light': '#8b4513',
          'wood-dark': '#3d1f0a',
        },
        // Faction colors
        'town': {
          DEFAULT: '#4169e1',
          light: '#87CEEB',
          dark: '#1e3a8a',
        },
        'mafia-red': {
          DEFAULT: '#8b0000',
          light: '#dc143c',
          dark: '#5c0000',
        },
        'neutral': {
          DEFAULT: '#808080',
          light: '#a9a9a9',
          dark: '#505050',
        },
        'coven': {
          DEFAULT: '#9932cc',
          light: '#ba55d3',
          dark: '#6a0dad',
        },
      },
      fontFamily: {
        'pirata': ['Pirata One', 'cursive'],
        'medieval': ['MedievalSharp', 'cursive'],
        'crimson': ['Crimson Text', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flicker': 'flicker 2s infinite',
        'pulse-glow': 'pulseGlow 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
            transform: 'scale(1.02)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      backgroundImage: {
        'wood-texture': "url('/textures/wood.jpg')",
        'parchment': "url('/textures/parchment.jpg')",
        'stone': "url('/textures/stone.jpg')",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-strong': '0 0 30px rgba(255, 215, 0, 0.6)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        'medieval': '0.5rem',
      },
    },
  },
  plugins: [],
}
