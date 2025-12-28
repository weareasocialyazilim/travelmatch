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
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      // ═══════════════════════════════════════════
      // COLORS - Sunset Proof Palette
      // ═══════════════════════════════════════════
      colors: {
        // CSS Variable based (for shadcn/ui compatibility)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Primary - Amber (Actions)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },

        // Secondary - Magenta (Emotion)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },

        // Accent - Seafoam (Discovery)
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },

        // Trust - Emerald (Reliability)
        trust: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },

        // Neutral - Warm Stone
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },

        // Semantic
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
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

        // Background
        cream: '#FFFCF8',
        'cream-dark': '#FFF9F2',
      },

      // ═══════════════════════════════════════════
      // TYPOGRAPHY
      // ═══════════════════════════════════════════
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },

      fontSize: {
        hero: [
          '4.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' },
        ],
        'hero-mobile': [
          '2.5rem',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        display: [
          '3rem',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'display-mobile': [
          '2rem',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
      },

      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },

      // ═══════════════════════════════════════════
      // SPACING
      // ═══════════════════════════════════════════
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      // ═══════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════
      borderRadius: {
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },

      // ═══════════════════════════════════════════
      // SHADOWS
      // ═══════════════════════════════════════════
      boxShadow: {
        card: '0 4px 24px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.15)',
        button: '0 4px 14px -2px rgba(245, 158, 11, 0.4)',
        'button-secondary': '0 4px 14px -2px rgba(236, 72, 153, 0.4)',
        'trust-glow': '0 0 40px -8px rgba(16, 185, 129, 0.5)',
        glass: '0 8px 32px -4px rgba(0, 0, 0, 0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },

      // ═══════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════
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
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'trust-ring-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'trust-ring-pulse': 'trust-ring-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },

      // ═══════════════════════════════════════════
      // BACKGROUND IMAGES
      // ═══════════════════════════════════════════
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        'gradient-sunset':
          'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #EC4899 100%)',
        'gradient-trust': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
        'gradient-discover':
          'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
        'gradient-card-overlay':
          'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%)',
        'gradient-radial-glow':
          'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
      },

      // ═══════════════════════════════════════════
      // BACKDROP BLUR
      // ═══════════════════════════════════════════
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
