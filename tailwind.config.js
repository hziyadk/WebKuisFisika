/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#002046",
        "primary-container": "#1b365d",
        "on-primary": "#ffffff",
        "on-primary-container": "#87a0cd",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#aec7f7",
        "on-primary-fixed": "#001b3d",
        "on-primary-fixed-variant": "#2e476f",
        "inverse-primary": "#aec7f7",

        "secondary": "#904d00",
        "secondary-container": "#fe932c",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#663500",
        "secondary-fixed": "#ffdcc3",
        "secondary-fixed-dim": "#ffb77d",
        "on-secondary-fixed": "#2f1500",
        "on-secondary-fixed-variant": "#6e3900",

        "tertiary": "#002522",
        "tertiary-container": "#003d37",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#3cafa2",
        "tertiary-fixed": "#89f5e7",
        "tertiary-fixed-dim": "#6bd8cb",
        "on-tertiary-fixed": "#00201d",
        "on-tertiary-fixed-variant": "#005049",

        "surface": "#f9f9ff",
        "surface-bright": "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-variant": "#d8e3fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        "surface-tint": "#465f88",
        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",

        "background": "#f9f9ff",
        "on-background": "#111c2d",
        "on-surface": "#111c2d",
        "on-surface-variant": "#44474e",

        "outline": "#74777f",
        "outline-variant": "#c4c6cf",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "margin-mobile": "1rem",
        "gutter-mobile": "1rem",
        "margin": "2rem",
        "gutter": "1.5rem"
      },
      fontFamily: {
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "code-md": ["JetBrains Mono", "monospace"],
        "code-sm": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-xl-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["22px", { lineHeight: "30px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["16px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "26px", letterSpacing: "-0.005em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.005em", fontWeight: "400" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "code-md": ["13px", { lineHeight: "20px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "code-sm": ["11px", { lineHeight: "16px", letterSpacing: "0em", fontWeight: "500" }]
      }
    }
  },
  plugins: []
};
