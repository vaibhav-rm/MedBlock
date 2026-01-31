/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary: Soft Teal/Aqua (health, trust)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Secondary: Warm Coral (emphasis & alerts)
        secondary: {
          50: '#fff5f3',
          100: '#ffe8e3',
          200: '#ffd1c7',
          300: '#ffb19f',
          400: '#ff8066',
          500: '#ff6b6b',
          600: '#ff7f50',
          700: '#e85d3a',
          800: '#c0422a',
          900: '#9e3524',
        },
        // Background & Text
        background: "#F5F5F5",
        text: {
          DEFAULT: '#334155',
          light: '#64748b',
          dark: '#0f172a',
        },
        // Status colors
        success: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fca5a5',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#d97706',
        },
        // Role-specific colors
        patient: '#14b8a6',
        doctor: '#3b82f6',
        researcher: '#8b5cf6',
        insurer: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-coral': '0 0 20px rgba(255, 107, 107, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
