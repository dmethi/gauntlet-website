# Animation Roadmap

Backlog of animation opportunities identified via a
`find-animation-opportunities` sweep on 2026-07-22. Each item passed the full
gate (frequency, purpose, speed, function) before landing here — see rejected
candidates at the bottom for what was deliberately left out.

Existing motion tokens (durations/easing) live in `packages/tokens/src/index.ts`
and should be reused rather than reinvented:

```ts
duration: { xfast: 120, fast: 180, base: 240, slow: 320, xslow: 420 }
easing: {
  ease: 'cubic-bezier(.2,.8,.2,1)',
  easeOut: 'cubic-bezier(.215,.61,.355,1)',
  easeInOut: 'cubic-bezier(.4,0,.2,1)',
}
```

Note: `framer-motion` is installed but unused anywhere in `apps/web/src`, and
`packages/ui/src/motion/variants.ts` (which consumes the tokens above) is also
never imported. Either wire these up or remove them — don't add a third,
parallel motion approach.

## Backlog

### 1. Form → confirmation swap (highest leverage)

- **Where**:
  `apps/web/src/app/year-in-review/_components/forms.tsx:105-113, 207-217, 306-315`
- **Today**: hard component swap the instant `status === 'done'` ("Registration
  received.", "Proposal received.")
- **Purpose**: preventing a jarring change + delight (one-shot, high-emotion
  action)
- **Frequency**: rare / first-time
- **Motion**: form exits `opacity:1→0, scale(1)→scale(0.98)` over
  `duration.fast` (180ms) `easing.easeOut`; confirmation enters
  `opacity:0→1, translateY(8px)→0` over `duration.base` (240ms) `easing.ease`,
  delayed ~80ms so it reads as a handoff.

### 2. `ManagerDetailModal` — replace hand-rolled modal with `Dialog` primitive

- **Where**: `apps/web/src/app/stats/components/ManagerDetailModal.tsx:19-38`
- **Today**: `if (!isOpen) return null;`, no transition primitive, instant
  appear/disappear
- **Purpose**: spatial consistency + preventing a jarring change
- **Frequency**: occasional
- **Motion**: swap to the existing `Dialog` primitive
  (`apps/web/src/components/ui/dialog.tsx`), which already provides
  `fade-in-0 zoom-in-95` in/out at `duration-200` — no new animation code
  needed, just stop bypassing what's already built.

### 3. Proposals loading → empty/content cross-fade

- **Where**:
  `apps/web/src/app/year-in-review/_components/proposals-display.tsx:36-60`
- **Today**: skeleton (`animate-pulse`) → empty state → real grid, each an early
  `return`, no bridge
- **Purpose**: preventing a jarring change
- **Frequency**: occasional
- **Motion**: cross-fade the swap — outgoing `opacity:1→0` over `duration.xfast`
  (120ms), incoming `opacity:0→1` over `duration.fast` (180ms) `easing.easeOut`,
  staggered to avoid a blank frame.

### 4. Landing-page grid entrance (Season Awards, Platform features)

- **Where**: `apps/web/src/app/year-in-review/page.tsx:363-430` and `:458-510`
- **Today**: `.map()` renders all cards at once, no entrance
- **Purpose**: delight
- **Frequency**: rare / first-time (once per visit, on scroll-into-view)
- **Motion**: 30–50ms stagger per card, `opacity:0→1, translateY(6px)→0`,
  `duration.base` (240ms) `easing.easeOut`, triggered via IntersectionObserver
  (not on mount), total stagger under ~400ms. Opacity-only fallback for
  `prefers-reduced-motion`.

### 5. Mobile tab-panel switch (league structure)

- **Where**:
  `apps/web/src/app/year-in-review/_components/league-structure.tsx:534-553`
- **Today**: instant content swap between `structurePanel` / `rosterPanel` on
  tab click
- **Purpose**: state indication
- **Frequency**: tens/day at most, likely occasional
- **Motion**: cross-fade only, `opacity` swap over
  `duration.xfast`–`duration.fast` (120–180ms) `easing.ease` — no
  transform/slide given the click frequency.

### 6. Inline form error messages

- **Where**:
  `apps/web/src/app/year-in-review/_components/forms.tsx:168-170, 257-259, 376-378`
- **Today**: `{status === 'error' && <p>...}` appears instantly
- **Purpose**: feedback
- **Frequency**: occasional (only on failed submit)
- **Motion**: `opacity:0→1, translateY(-4px)→0`, `duration.xfast` (120ms)
  `easing.easeOut`.

## Deliberately rejected

- **`TransactionFilters.tsx` search/filter result re-renders** — functional,
  information-dense data users are actively reading; motion here hinders.
- **`hall-of-fame/page.tsx:86-110` records list** — dense read-only data table,
  low leverage for entrance motion.
- **Global route/page transitions** (no `template.tsx` exists) — navigation is
  too frequent; risks feeling like added latency for no legibility gain.
- **Responsive `hidden`/`lg:hidden` breakpoint swaps** — fire on viewport
  resize, not a user action; no discrete moment to animate.
- **Button `:active` press feedback** — current `hover:bg-*` +
  `transition-colors` is adequate for this page's frequency tier; not worth a
  dedicated backlog item, but if added keep it subtle (`scale(0.98)`, ~120ms).
- **Hero orb keyframe animations** (`globals.css:228-278`) — already animated
  and intentional, no action needed.
