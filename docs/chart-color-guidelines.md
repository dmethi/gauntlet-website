# Chart Color Guidelines - The Gauntlet

## 🎨 Enhanced Chart Color System

The Gauntlet uses a sophisticated, theme-aware chart color system that
integrates brand colors with accessibility best practices for fantasy football
data visualization.

## 🎯 Color Philosophy

### Data Clarity First, Brand Second

- **High contrast colors** for data comparisons to ensure maximum readability
- **Brand colors** strategically used for UI elements (tooltips, accents,
  labels)
- **Team comparisons** use scientifically-optimized color palette with
  consistent assignment

### Smart Color Separation

- **Data visualization colors**: Optimized for differentiation and readability
- **Brand UI colors**: Gauntlet crimson/gold for tooltips, borders, accents
- **Context-aware usage**: Different palettes for different chart purposes

### Fantasy Football Context

- **Team vs Team**: Consistent color assignment across all charts using
  `getTeamColor()`
- **User team identification**: Brand crimson only when identifying user's team
- **Performance metrics**: Intuitive green→yellow→red performance mapping
- **Position colors**: Consistent QB(purple), RB(green), WR(blue) identification

### Accessibility Excellence

- **WCAG AA compliance** - all colors meet 4.5:1 contrast ratios
- **Maximum differentiation** - colors chosen for optimal distinction
- **Color blind friendly** - tested for deuteranopia and protanopia
- **Pattern support** - color alone never conveys critical information

## 🚀 Using the Color System

### Basic Usage

```tsx
import { useChartColors } from '@/lib/chart-colors';

export function MyChart() {
  const colors = useChartColors();

  return (
    <LineChart data={data}>
      <Line stroke={colors.primary} /> {/* Brand crimson */}
      <Line stroke={colors.secondary} /> {/* Regal gold */}
    </LineChart>
  );
}
```

### Static Colors (Non-React)

```tsx
import { staticChartColors, getChartColor } from '@/lib/chart-colors';

// Direct usage
const color = staticChartColors.primary;

// Function usage
const color = getChartColor('primary');
```

## 📊 Color Categories

### 1. Primary Data Series

Perfect for main chart data and user-focused metrics:

```tsx
const colors = useChartColors();

// Primary series colors
colors.primary; // Brand crimson - main user data
colors.secondary; // Regal gold - secondary metrics
colors.tertiary; // Amber - third data series
colors.quaternary; // Emerald - fourth data series
colors.quinary; // Blue - fifth data series
```

### 2. Fantasy Football Specific

```tsx
// Team identification
colors.team; // User's team (always brand crimson)
colors.opponent; // Opponent team (neutral)
colors.leagueAverage; // League average line

// Performance metrics
colors.performance.excellent; // 130+ points (green)
colors.performance.good; // 110+ points (light green)
colors.performance.average; // 90+ points (amber)
colors.performance.poor; // 70+ points (orange)
colors.performance.terrible; // <70 points (red)

// Luck indicators
colors.luck.lucky; // Positive variance (green)
colors.luck.neutral; // Expected outcomes (gray)
colors.luck.unlucky; // Negative variance (red)
```

### 3. Position-Specific Colors

```tsx
// Fantasy positions with intuitive colors
colors.positions.qb; // Purple for quarterbacks
colors.positions.rb; // Green for running backs
colors.positions.wr; // Blue for wide receivers
colors.positions.te; // Amber for tight ends
colors.positions.def; // Red for defense
colors.positions.k; // Gray for kickers
```

### 4. Categorical Data (12 distinct colors)

```tsx
// For team comparisons, multiple players, etc.
colors.categorical[0]; // Red
colors.categorical[1]; // Orange
colors.categorical[2]; // Amber
// ... up to colors.categorical[11]

// Or use helper function
import { getCategoricalPalette } from '@/lib/chart-colors';
const palette = getCategoricalPalette(theme);
```

## 🎨 Utility Functions

### Performance-Based Coloring

```tsx
import { getPerformanceColor } from '@/lib/chart-colors';

// Automatic color based on fantasy points
const pointsColor = getPerformanceColor(125, 'points', theme);

// Automatic color based on luck rating
const luckColor = getPerformanceColor(0.3, 'luck', theme);

// Automatic color based on percentage
const pctColor = getPerformanceColor(0.65, 'percentage', theme);
```

### Position-Based Coloring

```tsx
import { getPositionColor } from '@/lib/chart-colors';

const qbColor = getPositionColor('QB', theme);
const rbColor = getPositionColor('RB', theme);
```

## 📈 Chart Type Examples

### 1. Single Series Line Chart

**Use**: Primary series for main metric tracking

```tsx
<Line dataKey='points' stroke={colors.primary} name='Team Performance' />
```

### 2. Multi-Team Comparison ✅ IMPROVED

**Use**: Team color assignment for consistent identification

```tsx
import { getTeamColor } from '@/lib/chart-colors';

{
  teams.map(team => (
    <Line
      key={team.id}
      dataKey={team.id}
      stroke={getTeamColor(team.id, theme)} // Consistent across all charts
      name={team.name}
    />
  ));
}
```

**Why this is better**: Each team gets the same color across all charts, making
it easy to identify "Team A is always red, Team B is always blue" etc.

### 3. Performance Heatmap

**Use**: Performance gradient from terrible → excellent

```tsx
<Cell fill={getPerformanceColor(team.avgPoints, 'points', theme)} />
```

### 4. Position Breakdown Pie Chart

**Use**: Position-specific colors for clarity

```tsx
{
  positions.map(pos => (
    <Cell key={pos.name} fill={colors.positions[pos.name.toLowerCase()]} />
  ));
}
```

### 5. Luck vs Performance Scatter

**Use**: Semantic colors for quadrant meanings

```tsx
<Scatter
  data={data.map(team => ({
    ...team,
    fill: team.luck > 0 ? colors.luck.lucky : colors.luck.unlucky,
  }))}
/>
```

### 6. Brand UI Integration ✅ NEW

**Use**: Brand colors for UI elements, not data

```tsx
<Tooltip
  contentStyle={{
    background: colors.tooltip.background,
    border: `2px solid ${colors.brandPrimary}`, // Brand crimson accent
    color: colors.tooltip.text,
  }}
  labelStyle={{
    color: colors.brandPrimary, // Brand color for labels
    fontWeight: '600',
  }}
/>
```

**What this achieves**:

- Charts feel branded without sacrificing data readability
- Tooltips, borders, labels use brand colors
- Data itself uses high-contrast, distinguishable colors

## 🔍 Color Testing Checklist

### Before Using New Colors

✅ **Accessibility**: Test contrast ratios meet WCAG AA (4.5:1)  
✅ **Theme compatibility**: Test in both light and dark modes  
✅ **Color blindness**: Verify using tools like Stark or Sim Daltonism  
✅ **Brand alignment**: Ensure colors complement the Gauntlet aesthetic  
✅ **Mobile readability**: Test on small screens with different zoom levels

### Accessibility Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark Plugin](https://www.getstark.co/) for Figma/Sketch
- [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) for colorblind
  testing

## 🚫 Color Anti-Patterns

### Don't Do This ❌

```tsx
// Using hardcoded hex colors
<Line stroke="#ff0000" />

// Mixing color systems
<Line stroke={colors.primary} />
<Line stroke="#fbbf24" /> {/* Should use colors.secondary */}

// Too many categorical colors
{teams.slice(0, 15).map(() => (
  <Line stroke={colors.categorical[index]} /> // Only 12 colors available
))}

// Color-only information
<Cell fill={isWinner ? green : red} /> // Add text/icon for accessibility
```

### Do This Instead ✅

```tsx
// Use theme-aware colors
<Line stroke={colors.primary} />
<Line stroke={colors.secondary} />

// Respect categorical limits
const color = colors.categorical[index % 12];

// Multiple information channels
<Cell
  fill={isWinner ? colors.success : colors.error}
>
  {isWinner ? '🏆' : '❌'} {/* Icon + color */}
</Cell>
```

## 📋 Quick Reference

### Most Common Colors

```tsx
colors.primary; // Brand crimson - main data
colors.secondary; // Regal gold - secondary data
colors.team; // User team (crimson)
colors.opponent; // Opponent (neutral)
colors.success; // Positive outcomes
colors.warning; // Caution/average
colors.error; // Negative outcomes
```

### Chart Infrastructure

```tsx
colors.grid; // Grid lines
colors.axis; // Axis lines and text
colors.background; // Chart background
colors.surface; // Tooltip/legend background
```

### Fantasy Context

```tsx
colors.performance.*   // Scoring performance
colors.luck.*         // Variance/luck metrics
colors.positions.*    // Fantasy positions
colors.categorical    // Multiple teams/players
```

---

## 🎯 Key Takeaways

1. **Always use the color system** - never hardcode colors
2. **Test accessibility** - verify contrast and colorblind compatibility
3. **Provide context** - use icons/patterns alongside colors
4. **Stay consistent** - use the same colors for the same data types across
   charts
5. **Leverage semantics** - let colors reinforce the meaning of your data

This color system makes charts not just beautiful, but meaningful and accessible
to all users! 🎨✨
