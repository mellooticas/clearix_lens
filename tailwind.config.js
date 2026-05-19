/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/routes/**/*.{svelte,ts}',
    './src/lib/**/*.{svelte,ts}'
  ],

  // Safelist: arbitrary values em expressoes ternary podem nao ser detectados
  // pelo scanner do TW3. lg:w-[72px] usado em AppSidebar.svelte (sidebar collapsed).
  safelist: ['lg:w-[72px]'],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // ============================================================
        // Clearix Lens — Accent Color: Violet (#8B5CF6)
        // Ecossistema Clearix by DIGIAI — "Base Neutra + Sotaque de Cor"
        // ============================================================
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed', // ← COR PRINCIPAL do Clearix Lens
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: 'var(--primary)'
        },

        // ── Standardized Design Tokens (CSS Variables) ──────────────
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)'
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'primary-foreground': 'var(--primary-foreground)',

        // Semantic Colors (padrão ecossistema)
        success: {
          DEFAULT: '#22c55e',
          light: '#dcfce7',
          dark: '#15803d'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#b45309'
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#b91c1c'
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#1d4ed8'
        },

        // Ranking / Semáforo de prazo e preço
        'prazo-rapido': '#22c55e',
        'prazo-medio': '#f59e0b',
        'prazo-longo': '#ef4444',
        'preco-otimo': '#22c55e',
        'preco-bom': '#f59e0b',
        'preco-alto': '#ef4444',

        // Brand Colors (Clearix by DIGIAI Legacy & Special Accents)
        'brand-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#f59e0b'
        }
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Montserrat', 'system-ui', 'sans-serif']
      },

      boxShadow: {
        'card': '0 2px 8px rgba(124, 58, 237, 0.06)',
        'card-hover': '0 4px 16px rgba(124, 58, 237, 0.12)',
        'elevated': '0 8px 32px rgba(124, 58, 237, 0.16)'
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out'
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },

  plugins: []
};
