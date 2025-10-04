import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base design tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        
        // Sci-Fi Theme Colors - Professional & Modern
        stellar: {
          void: '#000000',     // Pure black void
          deep: '#0B0B0F',     // Deep space
          dark: '#151520',     // Space station interior
          midnight: '#1E1E2E', // Command center
          surface: '#2A2A3A',  // Panel surfaces
          border: '#3A3A4A',   // Interface borders
          glow: '#4A4A5A',     // Subtle highlights
        },
        
        // Primary accent - Cyan hologram
        cyber: {
          50: '#ECFEFF',
          100: '#CDFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#00D4FF',    // Primary cyber blue
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        
        // Secondary accent - Neon green
        matrix: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#00FF9F',    // Primary matrix green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        
        // Status colors for critical data
        hazard: {
          critical: '#FF1744',   // Critical threat
          high: '#FF6B35',       // High danger
          medium: '#FFD23F',     // Medium caution
          low: '#4ECDC4',        // Low risk
          safe: '#45B7D1',       // Safe zone
        },
        
        // Data visualization colors - High contrast
        data: {
          energy: '#FF6B35',     // Impact energy
          velocity: '#4ECDC4',   // Velocity indicators  
          mass: '#96CEB4',       // Mass/size
          distance: '#FFEAA7',   // Distance measurements
          time: '#DDA0DD',       // Time-based data
        },
        
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      
      fontFamily: {
        'display': ['Orbitron', 'monospace'],  // For titles and key data
        'sans': ['Inter', 'system-ui', 'sans-serif'], // Main UI text
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'], // Code/data
      },
      
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1', fontWeight: '900' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '800' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'data-xl': ['3rem', { lineHeight: '1', fontWeight: '900' }],
        'data-lg': ['2rem', { lineHeight: '1.1', fontWeight: '800' }],
        'data-md': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'panel': '12px',
        'control': '8px',
        'data': '6px',
      },
      
      backdropBlur: {
        'xs': '2px',
        'panel': '16px',
        'overlay': '24px',
      },
      
      boxShadow: {
        'glow-xs': '0 0 10px rgba(0, 212, 255, 0.2)',
        'glow-sm': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow': '0 0 30px rgba(0, 212, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.5)',
        'glow-xl': '0 0 60px rgba(0, 212, 255, 0.6)',
        'matrix-glow': '0 0 30px rgba(0, 255, 159, 0.4)',
        'hazard-glow': '0 0 30px rgba(255, 23, 68, 0.4)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'control': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'data': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
      },
      
      animation: {
        // Smooth, professional animations
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'matrix-pulse': 'matrixPulse 2s ease-in-out infinite',
        'hazard-blink': 'hazardBlink 1s ease-in-out infinite',
        'data-update': 'dataUpdate 0.3s ease-out',
        'orbit-slow': 'orbit 30s linear infinite',
        'orbit-medium': 'orbit 20s linear infinite', 
        'orbit-fast': 'orbit 10s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'scanner': 'scanner 2s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            borderColor: 'rgba(0, 212, 255, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)',
            borderColor: 'rgba(0, 212, 255, 0.6)'
          },
        },
        matrixPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 255, 159, 0.3)',
            borderColor: 'rgba(0, 255, 159, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 255, 159, 0.6)',
            borderColor: 'rgba(0, 255, 159, 0.6)'
          },
        },
        hazardBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        dataUpdate: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgba(0, 212, 255, 0.1)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgba(0, 212, 255, 0.2)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanner: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        'panel': '1.5rem',
        'control': '1rem',
        'data': '0.75rem',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
