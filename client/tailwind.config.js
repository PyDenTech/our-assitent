// client/tailwind.config.js
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Este caminho já cobre components, pages, app, etc.
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },

        // Keyframes do tailwindcss-animate
        "animate-in": {
          from: {
            opacity: "0",
            transform: "translateY(2px) scale(0.98)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "fade-in-0": { from: { opacity: "0" }, to: { opacity: "1" } },
        "zoom-in-95": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Animações do tailwindcss-animate
        "in": "animate-in 0.2s ease-out",
        "fade-in-0": "fade-in-0 0.2s ease-out",
        "zoom-in-95": "zoom-in-95 0.2s ease-out",
      },
    },
  },
  plugins: [animate], // O plugin já estava correto
};