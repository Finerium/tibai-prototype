import type { Config } from "tailwindcss";

/**
 * Single reconciled Tailwind configuration for both Tiba surfaces.
 *
 * The landing and the application share one brand: a terracotta signature
 * accent and warm neutrals (never pure black, never pure white). The detailed
 * surface palettes live in the scoped stylesheets (tiba-landing.css,
 * tiba-app.css); the values mirrored here make the brand tokens available to
 * Tailwind utilities as well. Dark mode is keyed off the application's
 * [data-theme="dark"] attribute so utility dark: variants stay in sync.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // warm neutral surfaces (landing, light-dominant)
        surface: {
          DEFAULT: "#f4f1ea",
          2: "#ece7dc",
          3: "#e3ddd0",
        },
        ink: {
          DEFAULT: "#1a1714",
          soft: "#5c554c",
          faint: "#8d857a",
        },
        // warm near-black ground (dark inversions)
        dark: {
          DEFAULT: "#14110d",
          2: "#1e1a15",
          ink: "#f1ece2",
        },
        // terracotta: the single shared signature accent
        accent: {
          DEFAULT: "#a8401f",
          deep: "#7f2f15",
          bright: "#d06a40",
          ink: "#f7f1ea",
        },
      },
      fontFamily: {
        // landing
        sans: ["var(--font-geist)", "Helvetica Neue", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-clash)", "var(--font-geist)", "sans-serif"],
        // application
        plex: ["var(--font-ibm-plex-sans)", "Segoe UI", "system-ui", "sans-serif"],
        "plex-mono": ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        brand: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
