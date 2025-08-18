---
alwaysApply: true
---

# Mobile-First Development Rules - The Gauntlet
# Enforced Mobile Responsiveness Standards for All Future Development

## 🎯 MOBILE-FIRST PRINCIPLE

```rule
ALL new development must be mobile-first by default. Desktop is an enhancement, not the target.
Start with mobile (320px+), progressively enhance for tablets (768px+), then desktop (1024px+).
```

## 📱 MANDATORY MOBILE STANDARDS

### Component Development Rules

```rule
EVERY new component MUST include:

1. **Responsive Grid Systems**:
   - Use: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Use: `flex-col sm:flex-row`
   - NEVER: fixed widths or non-responsive layouts

2. **Progressive Spacing**:
   - Use: `px-4 sm:px-6 lg:px-8`
   - Use: `py-4 sm:py-6 lg:py-8`
   - Use: `gap-4 sm:gap-6 lg:gap-8`
   - NEVER: single breakpoint spacing

3. **Touch-Friendly Interactions**:
   - Use: `.touch-target` utility (ensures 44px minimum)
   - Use: `min-h-[44px]` for interactive elements
   - Use: `p-2 sm:p-3` for buttons
   - NEVER: elements smaller than 44px on mobile

4. **Responsive Typography**:
   - Use: `.text-responsive-sm`, `.text-responsive-base`, `.text-responsive-lg`
   - Use: `text-sm sm:text-base lg:text-lg`
   - NEVER: fixed font sizes without breakpoints

5. **Overflow Protection**:
   - Use: `.no-overflow` utility for containers
   - Use: `overflow-x-auto` for tables
   - Use: `min-w-0` to prevent flex item overflow
   - NEVER: allow horizontal scrolling on main content
```

### Chart & Data Visualization Rules

```rule
ALL charts and data components MUST:

1. **Responsive Sizing**:
   - Use: `h-64 sm:h-80 md:h-96` height patterns
   - Use: `w-full min-w-0` width patterns
   - Include: ResizeObserver for dynamic sizing
   - Include: Orientation change handling

2. **Mobile Chart Optimization**:
   - Reduce data density on small screens
   - Larger touch targets for interactive elements
   - Simplified legends on mobile
   - Horizontal scrolling for wide datasets (with `overflow-x-auto`)

3. **Chart Container Structure**:
   ```tsx
   // REQUIRED pattern for all charts:
   <div className="h-64 sm:h-80 md:h-96 w-full min-w-0">
     <div ref={elementRef} className="h-full w-full">
       {size.width > 0 && size.height > 0 ? (
         <ChartComponent width={size.width} height={size.height} />
       ) : null}
     </div>
   </div>
   ```
```

### Table & Complex Layout Rules

```rule
ALL tables and complex layouts MUST:

1. **Horizontal Scroll Pattern**:
   ```tsx
   <div className="overflow-x-auto rounded-md border border-border bg-card">
     <Table>
       {/* Table content */}
     </Table>
   </div>
   ```

2. **Mobile-Optimized Tables**:
   - Use `min-w-[220px]` for complex table components
   - Implement card-based layouts for narrow screens when appropriate
   - Use `truncate` for long text in cells
   - Provide abbreviated column headers on mobile

3. **Card Layouts**:
   - Use: `.mobile-card` utility
   - Use: `bg-card border border-border rounded-lg p-4 sm:p-6`
   - Stack vertically on mobile: `flex-col sm:flex-row`
```

### Navigation & Interactive Elements

```rule
ALL navigation and interactive elements MUST:

1. **Mobile Navigation**:
   - Implement drawer pattern for mobile
   - Include proper overlay (`bg-black/50`)
   - Use slide animations (`transform translate-x-full`)
   - Include close buttons with touch targets

2. **Mobile Header Pattern**:
   ```tsx
   // REQUIRED mobile header pattern:
   <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
     <MobileMenuButton />
     <div className="flex-1">
       {/* Header content */}
     </div>
   </header>
   ```

3. **Button Standards**:
   - Use: `.mobile-button` or `.mobile-icon-button` utilities
   - Minimum: `min-h-[44px] min-w-[44px]`
   - Spacing: `px-4 py-2` minimum
   - Touch feedback: `active:scale-95 transition-transform`
```

## 🚫 FORBIDDEN PRACTICES

```rule
NEVER implement:

1. **Fixed Layouts**:
   ❌ Fixed pixel widths
   ❌ Non-responsive containers  
   ❌ Desktop-only design patterns
   ❌ Breakpoint-agnostic spacing

2. **Poor Touch Targets**:
   ❌ Elements smaller than 44px
   ❌ Links/buttons without adequate spacing
   ❌ Overlapping interactive areas

3. **Overflow Issues**:
   ❌ Horizontal scrolling on main content
   ❌ Content extending beyond viewport
   ❌ Fixed-width content without `min-w-0`

4. **Non-Responsive Components**:
   ❌ Charts without ResizeObserver
   ❌ Tables without horizontal scroll
   ❌ Forms without mobile optimization
   ❌ Modals that don't fit mobile screens
```

## ✅ REQUIRED TESTING CHECKLIST

```rule
BEFORE marking any UI work as complete, VERIFY:

### Mobile Device Testing (Required)
[ ] Test on real mobile device (iOS/Android)
[ ] Test on 320px viewport (smallest common size)
[ ] Test on 375px viewport (iPhone standard)
[ ] Test on 768px viewport (tablet portrait)
[ ] Test in both portrait and landscape orientations

### Touch Interaction Testing
[ ] All buttons and links are easily tappable
[ ] No accidental touches on nearby elements  
[ ] Swipe gestures work smoothly (where applicable)
[ ] Touch feedback is immediate and clear

### Layout Validation
[ ] No horizontal scrolling on main content
[ ] All text is readable without zooming
[ ] Charts and tables render properly
[ ] Navigation works seamlessly
[ ] Forms are usable with mobile keyboards

### Performance Check
[ ] Fast loading on mobile networks
[ ] Smooth scrolling and animations
[ ] No layout shifts during load
[ ] Responsive images load appropriately
```

## 🎨 MOBILE-FIRST CSS UTILITIES REFERENCE

```rule
USE these existing utilities (already implemented):

### Layout
- `.mobile-padding` → `px-4 sm:px-6 lg:px-8`
- `.mobile-margin` → `mx-4 sm:mx-6 lg:mx-8`
- `.mobile-grid` → responsive grid with proper gaps
- `.mobile-card` → `bg-card border border-border rounded-lg p-4 sm:p-6`
- `.no-overflow` → prevents horizontal overflow

### Typography
- `.text-responsive-sm` → `text-sm sm:text-base`
- `.text-responsive-base` → `text-base sm:text-lg`
- `.text-responsive-lg` → `text-lg sm:text-xl lg:text-2xl`
- `.text-responsive-xl` → `text-xl sm:text-2xl lg:text-3xl`

### Interactive
- `.touch-target` → `min-h-[44px] min-w-[44px] flex items-center justify-center`
- `.mobile-button` → `touch-target px-4 py-2 text-sm font-medium rounded-md transition-colors`
- `.mobile-icon-button` → `touch-target p-2 rounded-md transition-colors`

### Device-Specific
- `.safe-area-top` → `padding-top: env(safe-area-inset-top)`
- `.safe-area-bottom` → `padding-bottom: env(safe-area-inset-bottom)`
- `.scrollbar-hide` → hides scrollbars while keeping functionality
```

## 📋 CODE REVIEW CHECKLIST

```rule
ALL code reviews MUST verify:

### Mobile Responsiveness (Blocking)
[ ] All breakpoints follow mobile-first approach (`sm:`, `md:`, `lg:`)
[ ] Touch targets meet 44px minimum
[ ] No horizontal overflow issues
[ ] Charts include ResizeObserver and orientation handling
[ ] Tables have horizontal scrolling where needed

### CSS Class Validation
[ ] Uses existing responsive utility classes
[ ] Follows established spacing patterns
[ ] Implements proper touch-friendly sizing
[ ] Includes overflow protection

### Component Pattern Compliance
[ ] Navigation follows mobile drawer pattern
[ ] Charts follow responsive container pattern
[ ] Tables follow horizontal scroll pattern
[ ] Forms are mobile-keyboard friendly

### Testing Evidence
[ ] Developer tested on mobile device
[ ] Screenshots/recordings of mobile testing provided
[ ] Performance verified on mobile networks
```

## 🔗 INTEGRATION WITH EXISTING SYSTEMS

```rule
This mobile-first rule system integrates with:

- `technical-overview.md` - for component architecture
- `project-management.md` - for TODO validation
- `general.md` - for testing requirements
- `theming-guidelines.md` - for responsive color usage

ALL development must satisfy both mobile responsiveness AND existing technical requirements.
```

## 🏆 MOBILE EXCELLENCE STANDARDS

```rule
Strive for mobile excellence:

### Performance Targets
- First Contentful Paint < 2s on 3G
- Largest Contentful Paint < 4s on 3G  
- Cumulative Layout Shift < 0.1
- Time to Interactive < 5s on 3G

### Accessibility Standards
- WCAG AA compliance on mobile
- Screen reader compatibility
- High contrast mode support
- Keyboard navigation (external keyboards)

### User Experience Goals
- Thumb-friendly navigation
- Smooth 60fps animations
- Logical tab order
- Clear visual feedback for all interactions
```

---

**Remember**: Mobile users are not second-class citizens. They are often our primary users. Design for them first, enhance for desktop second.
