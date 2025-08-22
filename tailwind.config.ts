import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/main.tsx",
    "./src/App.tsx",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        gray100: "var(--gray100)",
        gray200: "var(--gray200)",
        gray250: "var(--gray250)",
        gray300: "var(--gray300)",
        purple: "var(--purple)",
        purple300: "var(--purple300)",
        purple600: "var(--purple600)",
        "primary-foreground": "hsl(var(--primary-foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "out-quad": "var(--ease-out-quad)",
        "out-cubic": "var(--ease-out-cubic)",
        "out-quart": "var(--ease-out-quart)",
        "out-quint": "var(--ease-out-quint)",
        "out-expo": "var(--ease-out-expo)",
        "out-circ": "var(--ease-out-circ)",
        sidebar: "var(--sidebar)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
