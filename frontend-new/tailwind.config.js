/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Dark Mode (Canvas Base) Tokens
        dark: {
          bg: '#050505',
          primary: '#00f0ff',
          secondary: '#9d05ff',
          surface: '#131313',
          text: '#e5e2e1',
          glow: '#00E5FF'
        },
        // Light Mode Tokens
        light: {
          bg: '#ffffff',
          primary: '#0052FF',
          secondary: '#6b00b0',
          surface: '#f8f9fa',
          text: '#1a1c1c',
          glow: '#0052FF'
        },
        // Mapped general colors for responsive theme styles
        "surface-container-high": "#2a2a2a",
        "on-primary-container": "#006970",
        "secondary-container": "#9d05ff",
        "on-primary": "#00363a",
        "inverse-surface": "#e5e2e1",
        "on-tertiary-container": "#5d5f5f",
        "background": "var(--background)",
        "tertiary-fixed": "#e2e2e2",
        "on-tertiary-fixed-variant": "#454747",
        "error": "#ffb4ab",
        "surface-bright": "#3a3939",
        "surface-variant": "#353534",
        "tertiary": "#f5f5f5",
        "surface-container-low": "#1c1b1b",
        "on-tertiary-fixed": "#1a1c1c",
        "inverse-on-surface": "#313030",
        "surface": "var(--surface)",
        "secondary-fixed-dim": "#dfb7ff",
        "secondary-fixed": "#f1daff",
        "on-secondary-container": "#f7e6ff",
        "primary-fixed-dim": "#00dbe9",
        "surface-container-highest": "#353534",
        "surface-tint": "#00dbe9",
        "primary-fixed": "#7df4ff",
        "on-surface-variant": "var(--on-surface-variant)",
        "secondary": "#dfb7ff",
        "outline": "#849495",
        "on-background": "var(--on-background)",
        "inverse-primary": "#006970",
        "on-error-container": "#ffdad6",
        "tertiary-fixed-dim": "#c6c6c7",
        "outline-variant": "#3b494b",
        "on-secondary-fixed": "#2d004f",
        "surface-container-lowest": "#0e0e0e",
        "on-secondary-fixed-variant": "#6b00b0",
        "primary-container": "#00f0ff",
        "surface-container": "#201f1f",
        "tertiary-container": "#d9d9d9",
        "error-container": "#93000a",
        "on-secondary": "#4b007e",
        "on-error": "#690005",
        "on-primary-fixed": "#002022",
        "primary": "var(--primary)",
        "on-tertiary": "#2f3131",
        "on-primary-fixed-variant": "#004f54",
        "surface-dim": "#131313",
        "on-surface": "var(--on-surface)"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "base": "8px",
        "section-gap": "120px",
        "margin-mobile": "16px",
        "container-max": "1440px",
        "gutter": "24px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "headline-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "display-xl": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Geist", "monospace"],
        "display-lg": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "display-xl": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "800" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite'
      }
    },
  },
  plugins: [],
}
