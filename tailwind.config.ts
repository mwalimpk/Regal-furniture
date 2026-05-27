import type { Config } from "tailwindcss";

const colorVar = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        obsidian: "#12140F",
        rifle: "#3A402D",
        olive: "#848961",
        taupe: "#63543F",
        crimson: "#63543F",
        orange: "#FCB040",
        ivory: "#F9F9F6",
        white: "#FFFFFF",
        border: colorVar("--border"),
        input: colorVar("--input"),
        ring: colorVar("--ring"),
        background: colorVar("--background"),
        foreground: colorVar("--foreground"),
        substrate: colorVar("--surface-rgb"),
        grid: colorVar("--grid-rgb"),
        label: colorVar("--label-rgb"),
        heritage: colorVar("--heritage-rgb"),
        interactive: colorVar("--interactive-rgb"),
        reading: colorVar("--reading-rgb"),
        primary: {
          DEFAULT: colorVar("--primary"),
          foreground: colorVar("--primary-foreground"),
        },
        "brand-green": "#3A402D",
        "brand-red": "#63543F",
        secondary: {
          DEFAULT: colorVar("--secondary"),
          foreground: colorVar("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: colorVar("--destructive"),
          foreground: colorVar("--destructive-foreground"),
        },
        muted: {
          DEFAULT: colorVar("--muted"),
          foreground: colorVar("--muted-foreground"),
        },
        accent: {
          DEFAULT: colorVar("--accent"),
          foreground: colorVar("--accent-foreground"),
        },
        popover: {
          DEFAULT: colorVar("--popover"),
          foreground: colorVar("--popover-foreground"),
        },
        card: {
          DEFAULT: colorVar("--card"),
          foreground: colorVar("--card-foreground"),
        },
        sidebar: {
          DEFAULT: colorVar("--sidebar-background"),
          foreground: colorVar("--sidebar-foreground"),
          primary: colorVar("--sidebar-primary"),
          "primary-foreground": colorVar("--sidebar-primary-foreground"),
          accent: colorVar("--sidebar-accent"),
          "accent-foreground": colorVar("--sidebar-accent-foreground"),
          border: colorVar("--sidebar-border"),
          ring: colorVar("--sidebar-ring"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
