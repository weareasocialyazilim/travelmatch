import type { Config } from 'tailwindcss';

/**
 * TravelMatch - Premium Awwwards-Ready Tailwind Config
 * Inspired by Tesla, Nvidia, Apple - Futuristic & Deep
 */

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Palette
        background: '#020202',
        foreground: '#ffffff',

        // Primary: Cyber Mint (Nvidia Vibe)
        primary: {
          DEFAULT: '#00FF88',
          glow: 'rgba(0, 255, 136, 0.3)',
          dark: '#00CC6E',
          light: '#33FF9F',
        },

        // Secondary: Electric Purple
        secondary: {
          DEFAULT: '#8B5CF6',
          glow: 'rgba(139, 92, 246, 0.3)',
          dark: '#7C3AED',
          light: '#A78BFA',
        },

        // Accent: Liquid Gold
        accent: {
          DEFAULT: '#FACC15',
          glow: 'rgba(250, 204, 21, 0.3)',
          dark: '#EAB308',
          light: '#FDE047',
        },

        // UI Colors
        card: 'rgba(255, 255, 255, 0.03)',
        'card-hover': 'rgba(255, 255, 255, 0.06)',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(255, 255, 255, 0.15)',
        muted: 'rgba(255, 255, 255, 0.5)',

        // Legacy support
        acid: '#00FF88',
        'neon-pink': '#ff0099',
        'electric-blue': '#00f0ff',
        'deep-purple': '#140024',
      },

      fontFamily: {
        clash: ['var(--font-clash)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        syne: ['Syne', 'system-ui', 'sans-serif'],
        grotesk: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Fluid Typography Scale
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 5vw, 5rem)',
        'fluid-6xl': 'clamp(3.75rem, 2.5rem + 6.25vw, 6rem)',
        'fluid-hero': 'clamp(4rem, 3rem + 8vw, 10rem)',
      },

      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-8': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
        'fluid-16': 'clamp(4rem, 3rem + 5vw, 8rem)',
      },

      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out infinite 1.5s',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        'glow-sm': '0 0 20px rgba(0, 255, 136, 0.2)',
        'glow-md': '0 0 30px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 50px rgba(0, 255, 136, 0.4)',
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 30px rgba(250, 204, 21, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #00FF88 0%, #8B5CF6 50%, #FACC15 100%)',
        'gradient-dark': 'linear-gradient(180deg, #020202 0%, #0a0a0a 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
