import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Override default border radius with our semantic scale
    borderRadius: {
      none: '0',
      xs: 'var(--radius-xs)',
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
      full: 'var(--radius-full)',
    },
    extend: {
      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
        body: ['var(--font-body)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // ── Colors ─────────────────────────────────────────────
      colors: {
        // Surfaces & backgrounds
        background: {
          DEFAULT: 'var(--color-bg)',
          alt: 'var(--color-bg-alt)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
        },

        // Brand – sage green
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          mid: 'var(--color-primary-mid)',
          dark: 'var(--color-primary-dark)',
          text: 'var(--color-primary-text)',
        },

        // Accent – warm terracotta
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },

        // Text
        ink: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          'on-primary': 'var(--color-text-on-primary)',
        },

        // Borders
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },

        // Semantic status
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
        },
      },

      // ── Shadows ────────────────────────────────────────────
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'bottom-nav': 'var(--shadow-bottom-nav)',
        inner: 'inset 0 1px 3px rgba(28, 25, 23, 0.06)',
      },

      // ── Motion ─────────────────────────────────────────────
      transitionTimingFunction: {
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        snap: 'cubic-bezier(0.19, 1, 0.22, 1)',
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '220ms',
        slow: '280ms',
        slower: '300ms',
      },

      // ── Layout ─────────────────────────────────────────────
      maxWidth: {
        content: 'var(--content-max-width)',
        sidebar: 'var(--desktop-sidebar-width)',
      },
      spacing: {
        'bottom-nav': 'var(--bottom-nav-height)',
        'top-bar': 'var(--top-bar-height)',
      },
      height: {
        'bottom-nav': 'var(--bottom-nav-height)',
        'top-bar': 'var(--top-bar-height)',
        screen: '100dvh',
      },
      minHeight: {
        screen: '100dvh',
      },

      // ── Keyframe Animations ────────────────────────────────
      animation: {
        'fade-in': 'fadeIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slideUp 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slideDown 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to: { backgroundPosition: '200% center' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
    },
  },
  plugins: [],
}

export default config
