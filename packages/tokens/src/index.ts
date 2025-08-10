export const motion = {
  duration: {
    xfast: 120,
    fast: 180,
    base: 240,
    slow: 320,
    xslow: 420,
  },
  easing: {
    ease: 'cubic-bezier(.2,.8,.2,1)',
    easeOut: 'cubic-bezier(.215,.61,.355,1)',
    easeInOut: 'cubic-bezier(.4,0,.2,1)',
  },
};

export type ChartPalette = {
  categorical: string[];
  sequential: string[];
  diverging: string[];
};

export const colors = {
  // semantic roles are derived from CSS variables set by the app
  roles: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    surface: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
  },
  charts: {
    categorical: [
      'var(--gauntlet-crimson, #8B1538)',
      'var(--gauntlet-regal-gold, #D4AF37)',
      '#2D5A87',
      '#8B4513',
      '#556B2F',
      '#4B0082',
      '#CD853F',
      '#2F4F4F',
      '#8B008B',
      '#B8860B',
      '#483D8B',
      '#A0522D',
    ],
    sequential: [
      '#FFF5F0',
      '#FEE0D2',
      '#FCBBA1',
      '#FC9272',
      '#FB6A4A',
      '#EF3B2C',
      '#CB181D',
      '#A31621',
      '#8B1538',
    ],
    diverging: ['#8B1538', '#F3E9D2', '#2C4D3A'],
  },
};

export { default as tailwindPreset } from '../tailwind-preset';
