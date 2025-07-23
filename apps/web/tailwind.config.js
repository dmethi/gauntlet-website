/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        avenir: "var(--font-avenir)",
        "work-sans": ["var(--font-work-sans)", "sans-serif"],
        geizer: ["var(--font-geizer)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        "fira-sans": ["var(--font-fira-sans)", "sans-serif"],
        "ibm-plex-sans": ["var(--font-ibm-plex-sans)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Gauntlet Brand Colors - Balanced Medieval Theme
        gauntlet: {
          crimson: '#8B1538',      // Deep burgundy primary red
          battle: '#A31621',       // Secondary red tone  
          ember: '#6B1426',        // Darkest red for depth
          'regal-gold': '#D4AF37', // Co-primary royal gold
          'warm-gold': '#EBB748',  // Brighter gold accent
          charcoal: '#1A1A1A',     // Softer charcoal
          'off-white': '#F3E9D2',  // Neutral light
          'burnt-orange': '#B8621B', // Muted orange bridge
        },
        
        // Data visualization colors
        viz: {
          // 12-Color Team Visualization Palette (distinct colors for 12 teams)
          team: {
            1: '#8B1538',  // Crimson Red
            2: '#D4AF37',  // Regal Gold  
            3: '#2D5A87',  // Steel Blue
            4: '#8B4513',  // Saddle Brown
            5: '#556B2F',  // Dark Olive Green
            6: '#4B0082',  // Indigo
            7: '#CD853F',  // Peru
            8: '#2F4F4F',  // Dark Slate Gray
            9: '#8B008B',  // Dark Magenta
            10: '#B8860B', // Dark Goldenrod
            11: '#483D8B', // Dark Slate Blue
            12: '#A0522D'  // Sienna
          },
          
          // RdYlGn scale for performance metrics
          'rd-yl-gn': ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
