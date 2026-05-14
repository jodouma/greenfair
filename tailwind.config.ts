import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "sans-serif"]
      },
      colors: {
        ink: "#07111f",
        shell: "#f6f7f2",
        emerald: {
          50: "#ecfdf5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857"
        }
      },
      boxShadow: {
        soft: "0 22px 60px rgba(7, 17, 31, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(16,185,129,0.22), transparent 34%), linear-gradient(135deg, rgba(7,17,31,0.98) 0%, rgba(15,23,42,0.92) 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
