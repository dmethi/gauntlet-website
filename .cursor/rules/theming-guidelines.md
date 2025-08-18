---
alwaysApply: true
---

# The Gauntlet - Theming & Color System Guidelines

This file enforces consistent theming practices across The Gauntlet codebase to ensure proper light/dark mode support and prevent color regressions.

## 🎨 CORE THEMING PRINCIPLES

```rule
MANDATORY: All visual elements MUST respect theme switching

### Color Usage Hierarchy:
1. **CSS Variables** (Preferred): Use `hsl(var(--primary))`, `hsl(var(--muted))`, etc.
2. **Tailwind Classes** (Good): Use `bg-primary`, `text-muted-foreground`, etc.
3. **Brand Colors** (Limited): Only for specific brand elements
4. **Hardcoded Colors** (FORBIDDEN): Never use `#XXXXXX`, `rgb()`, or named colors
```

## 🚫 FORBIDDEN PATTERNS

```rule
### NEVER use these patterns:

❌ **Hardcoded Hex Colors**
- `stroke='#000000'`
- `fill='#A1A8B3'` 
- `backgroundColor='#f3f3f3'`
- `color: '#6b7280'`

❌ **RGB/HSL Values**
- `stroke='rgb(0, 0, 0)'`
- `color: 'hsl(240, 5%, 64%)'`

❌ **Named Colors**
- `stroke='black'`
- `fill='gray'`
- `color: 'white'`

❌ **Theme-specific Hardcoded Classes**
- `bg-gray-200 dark:bg-gray-700` (use `bg-muted` instead)
- `text-black dark:text-white` (use `text-foreground` instead)
```

## ✅ APPROVED PATTERNS

```rule
### Chart Colors (Recharts Components)

**USE**: Theme-aware chart color hook
```typescript
import { useChartColors } from '@/lib/chart-colors';

function MyChart() {
  const chartColors = useChartColors();
  
  return (
    <LineChart>
      <CartesianGrid stroke={chartColors.grid} />
      <XAxis stroke={chartColors.axis} />
      <Line stroke={chartColors.primary} />
      <Line stroke={chartColors.opponent} />
    </LineChart>
  );
}
```

**DON'T USE**: Hardcoded chart colors
```typescript
// ❌ WRONG
<Line stroke='#000000' />
<XAxis stroke='#9ca3af' />
```

### CSS Variables (Direct Usage)
```css
/* ✅ CORRECT */
stroke='hsl(var(--muted-foreground))'
fill='hsl(var(--primary))'
backgroundColor='hsl(var(--card))'

/* ❌ WRONG */
stroke='#6b7280'
fill='#8B1538'
```

### Tailwind Classes  
```jsx
/* ✅ CORRECT */
className='bg-primary text-primary-foreground'
className='border-border text-muted-foreground'
className='bg-muted hover:bg-muted/80'

/* ❌ WRONG */
className='bg-red-500 text-white'
className='border-gray-300 text-gray-600'
```

### Skeleton Loaders
```tsx
/* ✅ CORRECT */
<ContentLoader
  backgroundColor='hsl(var(--muted))'
  foregroundColor='hsl(var(--muted-foreground))'
/>

/* ❌ WRONG */
<ContentLoader
  backgroundColor='#f3f3f3'
  foregroundColor='#ecebeb'
/>
```
```

## 🎯 COMPONENT-SPECIFIC GUIDELINES

```rule
### Chart Components
- MUST use `useChartColors()` hook for dynamic theming
- Grid lines: `chartColors.grid`
- Axes: `chartColors.axis` 
- Data series: `chartColors.primary`, `chartColors.secondary`, etc.
- Opponent data: `chartColors.opponent`
- League averages: `chartColors.leagueAverage`

### SVG Elements
- Lines/borders: `stroke='hsl(var(--border))'`
- Text: `fill='hsl(var(--muted-foreground))'`
- Background shapes: `fill='hsl(var(--card))'`

### Progress Bars
- Background: `bg-muted`
- Fill: `bg-primary`
- NEVER use: `bg-gray-200 dark:bg-gray-700`

### Loading States  
- Skeleton backgrounds: `hsl(var(--muted))`
- Skeleton foregrounds: `hsl(var(--muted-foreground))`

### Interactive Elements
- Buttons: Use button variants (`primary`, `secondary`, `outline`)
- Links: `text-primary hover:text-primary/80`
- Form inputs: `border-border bg-background`
```

## 🔧 AVAILABLE COLOR TOKENS

```rule
### Semantic CSS Variables (Always Available)
- `--background` / `--foreground` - Page background and main text
- `--card` / `--card-foreground` - Card backgrounds and text  
- `--primary` / `--primary-foreground` - Brand colors
- `--secondary` / `--secondary-foreground` - Secondary actions
- `--muted` / `--muted-foreground` - Subdued elements
- `--accent` / `--accent-foreground` - Accent colors
- `--destructive` / `--destructive-foreground` - Error/danger
- `--border` - Borders and dividers
- `--input` - Form input backgrounds
- `--ring` - Focus rings

### Chart-Specific Variables  
- `--chart-1` through `--chart-5` - Theme-aware data visualization
- Use via `chartColors` hook for dynamic theming

### Brand Colors (Limited Use)
- `gauntlet-crimson`, `gauntlet-regal-gold` - Only for brand-specific elements
- Generally prefer semantic tokens over brand colors
```

## 🛡️ TESTING & VALIDATION

```rule
### Before Committing Code:
1. **Theme Toggle Test**: Switch between light/dark modes
2. **Visual Inspection**: Ensure no hardcoded colors remain
3. **Contrast Check**: Verify WCAG AA compliance
4. **Mobile Test**: Check theme consistency on small screens

### Code Review Checklist:
- [ ] No hex colors (#XXXXXX) in new code
- [ ] All charts use `useChartColors()` hook
- [ ] SVG elements use CSS variables
- [ ] Skeleton loaders use theme-aware colors
- [ ] Progress indicators use semantic classes
```

## 🔄 MIGRATION PATTERNS

```rule
### Common Replacements:

**Hardcoded Chart Colors**
```typescript
// Before
stroke='#000000' → stroke={chartColors.opponent}
stroke='#A1A8B3' → stroke={chartColors.leagueAverage}  
stroke='#82ca9d' → stroke={chartColors.luck}
fill='#111111'   → fill={chartColors.opponentBar}
```

**Skeleton Loaders**  
```typescript
// Before
backgroundColor='#f3f3f3' → backgroundColor='hsl(var(--muted))'
foregroundColor='#ecebeb' → foregroundColor='hsl(var(--muted-foreground))'
```

**SVG Graphics**
```typescript  
// Before
stroke='#e5e7eb' → stroke='hsl(var(--border))'
fill='#6b7280'   → fill='hsl(var(--muted-foreground))'
stroke='#ef4444' → stroke='hsl(var(--destructive))'
```

**Progress Bars**
```css
/* Before */
bg-gray-200 dark:bg-gray-700 → bg-muted
bg-red-500                   → bg-primary
```
```

## 🚨 ENFORCEMENT

```rule
### Automatic Checks:
- ESLint rules should flag hardcoded colors
- Pre-commit hooks should validate theme compliance
- Code reviews MUST verify theming standards

### When Adding New Components:
1. Start with semantic CSS variables
2. Test in both light and dark modes
3. Use `useChartColors()` for any data visualization
4. Document any brand-specific color usage

### When Modifying Existing Components:
1. Replace any found hardcoded colors
2. Ensure theme switching works instantly  
3. Verify accessibility contrast ratios
4. Test on multiple screen sizes
```

---

**Remember**: Consistent theming is a user experience requirement, not just a nice-to-have. Following these guidelines ensures The Gauntlet works beautifully in both light and dark modes for all users.
