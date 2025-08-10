// Gauntlet Brand Color System
// Medieval/gilded war aesthetic with data visualization support

export const colors = {
  // 🎨 Core Brand Palette (balanced to match logo)
  core: {
    crimsonRed: '#8B1538', // Deep burgundy red from logo
    battleRed: '#A31621', // Secondary red tone
    emberRed: '#6B1426', // Darkest red for depth
    regalGold: '#D4AF37', // Co-primary gold (royal gold)
    warmGold: '#EBB748', // Brighter gold accent
    charcoalSteel: '#1A1A1A', // Softer charcoal (not pure black)
    offWhite: '#F3E9D2', // Neutral light text
    burntOrange: '#B8621B', // Muted orange bridge color
  },

  // 🌈 Categorical team palette (shadcn-aligned, balanced spectrum; distinct hues)
  teamCategorical: [
    '#f43f5e', // rose-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#65a30d', // lime-600
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#2563eb', // blue-600
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
  ],

  // 📊 Data Visualization Palettes

  // Sequential palette (neutral to brand accent)
  sequentialWarm: [
    '#fff7ed',
    '#ffedd5',
    '#fed7aa',
    '#fdba74',
    '#fb923c',
    '#f97316',
    '#ea580c',
    '#c2410c',
  ],

  // Red→Yellow→Green scale for performance (ColorBrewer-inspired RdYlGn 11-step)
  rdylgn: [
    '#a50026',
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#ffffbf',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
    '#006837',
  ],

  // Diverging palette (brand negative vs emerald positive)
  diverging: {
    negative: '#8B1538',
    neutral: '#e5e7eb',
    positive: '#10B981',
  },

  // Sequential palettes for data ranges
  sequential: {
    reds: [
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
    golds: [
      '#FFFBF0',
      '#FEF0D9',
      '#FDD49E',
      '#FDBB84',
      '#FC8D59',
      '#EF6548',
      '#D7301F',
      '#B30000',
      '#7F0000',
    ],
    neutrals: [
      '#FFFFFF',
      '#F8F8F8',
      '#E8E8E8',
      '#D3D3D3',
      '#BEBEBE',
      '#969696',
      '#737373',
      '#525252',
      '#252525',
    ],
  },
};

// 🎯 Semantic Color Mapping (Linear-style dark mode intensity)
export const semanticColors = {
  // Primary actions and focus states
  primary: colors.core.crimsonRed,
  primaryHover: colors.core.battleRed,
  primaryActive: colors.core.emberRed,

  // Secondary actions and accents
  secondary: colors.core.regalGold,
  secondaryHover: colors.core.warmGold,

  // Status and feedback colors
  success: '#10B981', // Emerald green
  warning: colors.core.burntOrange,
  error: colors.core.battleRed,
  info: '#3B82F6', // Blue

  // Neutral colors - Linear-inspired dark mode
  background: '#0D0D0D', // Near black background (Linear style)
  surface: '#141414', // Slightly lighter surface
  surfaceHover: '#1A1A1A', // Hover state for surfaces
  border: '#2A2A2A', // Subtle borders
  text: colors.core.offWhite,
  textMuted: '#8A8A8A', // Muted text (not too light)
  textInverse: '#0D0D0D', // Inverse text
};

// 📈 Data Visualization Color Helper
export const dataVizColors = {
  // Use this for categorical data (teams, players, etc.)
  categorical: colors.teamCategorical,

  // Use this for performance metrics (red → yellow → green)
  performance: colors.rdylgn,

  // Use this for binary comparisons or showing deviation
  comparison: [colors.core.crimsonRed, colors.core.regalGold],

  // Use this for heatmaps and intensity scales
  intensity: colors.sequential.reds,

  // Use this for showing rankings or tiers
  ranking: [
    colors.core.regalGold, // Gold tier
    '#C0C0C0', // Silver tier
    '#CD7F32', // Bronze tier
    colors.core.charcoalSteel, // Base tier
  ],
};

export default colors;

export type Color = keyof typeof colors;
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
