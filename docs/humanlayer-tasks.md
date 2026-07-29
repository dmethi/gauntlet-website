# HumanLayer Follow-Up Tasks

Execution-ready backlog produced by the public web specification audit
(`.humanlayer/tasks/gauntlet-website-specification-audit/05-audit-public-web-findings.md`).
Each brief below corresponds to one numbered item in that artifact's §3
"Prioritized follow-ups" and follows the `docs/ISSUE_GROOMING.md` template.
Briefs are listed in the same priority order as §3.

---

<a id="brief-1-soft-404s"></a>

## 1. Soft 404s on detail routes

### Summary

`/managers/[ownerId]` and `/team/[id]` render an in-page "not found"
presentation for a missing resource instead of calling `notFound()`, so a
missing manager or team returns HTTP 200 with soft-404 content that crawlers and
agents cannot distinguish from a real profile.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. In `apps/web/src/app/managers/[ownerId]/page.tsx`, replace the
     `if (!history) { return (<div>...manager not found...</div>) }` branch
     (currently lines 39-51) with `import { notFound } from 'next/navigation';`
     and `if (!history) notFound();`.
  2. Add `apps/web/src/app/managers/[ownerId]/not-found.tsx`, a server component
     modeled on
     `apps/web/src/app/competition/reports/[season]/[slug]/not-found.tsx`
     (`PageHeader`/`Card`/`Button` pattern), with copy for a manager that
     doesn't exist and a link back to `/managers`.
  3. In `apps/web/src/app/team/[id]/page.tsx` (a client component,
     `'use client'` at line 1), import `notFound` from `next/navigation` and
     call it in place of the two "Team not found" branches (currently around
     lines 49-59, the `error` and `!team` cases). `notFound()` is supported in
     Client Components — it throws a special error (`digest: 'NEXT_NOT_FOUND'`)
     that the nearest App Router error/not-found boundary catches regardless of
     whether the throwing component is a Server or Client Component.
  4. Add `apps/web/src/app/team/[id]/not-found.tsx`, same pattern, linking back
     to `/managers` or `/archive/2025`.
  5. `apps/web/src/__tests__/route-boundaries.test.ts` already asserts "every
     page that calls `notFound()` has a sibling `not-found.tsx`" — it will fail
     if step 2 or 4 is skipped, which is the point of writing it that way.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web test -- route-boundaries` (new boundaries must
    satisfy the existing filesystem-invariant test)
  - `pnpm --filter @gauntlet/web build`, then `next start`;
    `curl -s -o /dev/null -w '%{http_code}' localhost:PORT/managers/does-not-exist`
    and the equivalent for `/team/does-not-exist` must both return `404`, not
    `200`
  - Manual: visit both 404s in a browser, confirm the rendered page matches the
    `not-found.tsx` copy, not a raw Next default error page

### Design Decisions

- **Approach**: use Next's built-in `notFound()` + sibling `not-found.tsx`
  boundary, the same mechanism Phase 1 already established for
  `/competition/reports/[season]/[slug]`. No new abstraction.
- **Files to modify**: `apps/web/src/app/managers/[ownerId]/page.tsx`,
  `apps/web/src/app/team/[id]/page.tsx`
- **Files to create**: `apps/web/src/app/managers/[ownerId]/not-found.tsx`,
  `apps/web/src/app/team/[id]/not-found.tsx`
- **Patterns to follow**:
  `apps/web/src/app/competition/reports/[season]/[slug]/not-found.tsx` (visual
  pattern and structure);
  `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx:77,82`
  (existing `notFound()` call sites in this codebase)

### Risk Assessment

- **Blast radius**: low — isolated to two route files plus two new boundary
  files. No shared component or data-fetching logic changes.
- **Affected areas**: `/managers/[ownerId]`, `/team/[id]`, `/team/[id]/stats`
  (the stats sub-route reads `useTeamData` too, but does not currently render
  its own not-found branch — confirm during implementation whether it needs the
  same treatment or can rely on the parent route's `notFound()` never resolving
  in the first place).
- **Rollback**: standard revert.

### Implementation Notes

- `getManagerHistory` already returns `null`/falsy for an unknown owner id
  (`apps/web/src/app/managers/[ownerId]/page.tsx:37,39`) — no data-layer change
  needed, only how the page reacts to that result.
- `/team/[id]/page.tsx` uses `useTeamData(params.id)` which returns
  `{ team, loading, error }`; keep the existing `loading` branch
  (`WarRoomLoader`) untouched and only change the `error`/`!team` branches to
  call `notFound()`.
- Depends on nothing else in this backlog.

### Test Strategy

- **Guardrails**: `route-boundaries.test.ts`'s existing four filesystem
  invariants must still pass with the two new boundary files in place.
- **New functionality**: add or extend a route test (following
  `apps/web/src/app/__tests__/not-found.test.tsx`'s pattern) asserting the two
  new `not-found.tsx` files render a recovery link.
- **Regression check**: the existing
  `apps/web/src/app/managers/[ownerId]/page.test.tsx` and
  `apps/web/src/app/team/[id]/page.test.tsx` (if present) must still pass for
  the found-manager/found-team cases.

### Acceptance Criteria

- [ ] `curl` against an unknown owner id / team id on both routes returns HTTP
      404
- [ ] Both new `not-found.tsx` pages render inside the app shell with a recovery
      link, not a raw Next default 404
- [ ] `route-boundaries.test.ts` passes
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- `/team/[id]/stats` — evaluate separately whether it needs its own `notFound()`
  call; do not change its data-fetching logic here.
- Any change to `getManagerHistory` or `useTeamData` themselves.

---

<a id="brief-2-server-side-root-redirect"></a>

## 2. Server-side root redirect

### Summary

`/` mounts a client component that calls `router.replace('/competition')` after
hydration, so crawlers, agents, and slow clients see only a spinner before the
real destination loads. Replace it with a server-side redirect (or a real
landing page).

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. Read `apps/web/src/app/page.tsx:6-21` to confirm the current
     `'use client'` + `useEffect(() => router.replace('/competition'))` shape.
  2. Replace the file's default export with a server-side
     `redirect('/competition')` from `next/navigation`, called directly in a
     server component body (no `'use client'`, no `useEffect`). This is a
     permanent-redirect-equivalent at the framework level; Next issues a 307 by
     default from `redirect()` inside a Server Component render.
  3. Alternatively, add a `redirects()` entry in `apps/web/next.config.js`
     (which already has a `redirects()` block for `/matchup/:matchupId`) for
     `source: '/', destination: '/competition', permanent: false` — this is a
     platform-level redirect that never renders the `/` route at all, which is
     the stronger fix if `/` is never meant to serve its own content.
  4. Delete `apps/web/src/app/page.tsx`'s client-side redirect logic once the
     `next.config.js` redirect is confirmed serving `/` with a 3xx.
  5. Decide during implementation between "config-level redirect, delete the
     page" and "keep the page, make it a server redirect" — both close the
     finding; the config-level redirect also removes `/` from the route table
     entirely, which is the cleaner fix if `/` never needs to render anything of
     its own.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web build`, `next start`, then
    `curl -sI localhost:PORT/` — must show a `3xx` status and a
    `location: /competition` header, not a `200` with an HTML spinner
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - Manual: visit `/` in a browser with JavaScript disabled (or via `curl`) and
    confirm the redirect happens without executing any client JS

### Design Decisions

- **Approach**: prefer the `next.config.js` `redirects()` entry — it matches the
  existing pattern in this file (`/matchup/:matchupId`), requires no new page
  code, and removes `/` from the client bundle entirely rather than shipping a
  page whose only job is to redirect.
- **Files to modify**: `apps/web/next.config.js` (add a redirect entry);
  `apps/web/src/app/page.tsx` (delete, if the config-level redirect is chosen)
- **Patterns to follow**: `apps/web/next.config.js`'s existing `redirects()`
  block (the `/matchup/:matchupId` entry, immediately following the `headers()`
  function this repo's Phase 3 work added)

### Risk Assessment

- **Blast radius**: low — `/` currently renders nothing of lasting value (a
  spinner), so removing its client bundle cannot regress a real user-facing
  feature. The only risk is picking the wrong redirect status code for SEO
  purposes (see below).
- **Affected areas**: `/` only. Also interacts with Phase 2's canonical/
  indexing metadata (see item 6 below) and with the sitemap, which already
  deliberately excludes `/` (§2.2).
- **Rollback**: standard revert.

### Implementation Notes

- **Depends on nothing** — sequence it before item 6 in this backlog, not after,
  since item 6 (per-page canonical/`og:url` ownership) needs to know what `/`
  resolves to before it can decide `/`'s own canonical value.
- Decide the redirect's permanence deliberately: `permanent: true` emits a 308
  and is cached hard by browsers/CDNs; `permanent: false` emits a 307 and is
  revisitable. Given `/competition` itself may not be the permanent front door
  forever (a real landing page is also an option per the outline), a **temporary
  (307)** redirect is the safer default unless there's a firm commitment to
  `/competition` being the permanent home for `/`.

### Test Strategy

- **Guardrails**: no other redirect entries in `next.config.js` should be
  disturbed.
- **New functionality**: an integration-style test or a build-output check
  confirming `/` no longer ships a page bundle (if the config-route approach is
  taken) or that it server-redirects (if the page-level approach is taken).
- **Regression check**: confirm `/competition` itself is unaffected and that no
  other route depends on `/` rendering actual content.

### Acceptance Criteria

- [ ] `curl -sI localhost:PORT/` returns a 3xx with `location: /competition`
- [ ] No client-side JavaScript is required for the redirect to occur
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Building a real, distinct landing page for `/` (the outline names this as an
  alternative but the audit does not pick one; leave that decision to whoever
  picks up this brief, informed by the note above).
- Item 6 (per-page canonical/`og:url` ownership) — sequence after this brief, do
  not fold in here.

---

<a id="brief-3-empty-vs-failed-time-series"></a>

## 3. Distinguish empty from failed time-series

### Summary

The win-probability and score-over-time charts on a matchup detail page render
"Live data not yet available" both when the time-series fetch fails and when it
succeeds with an empty series, even though the API already models the
distinction as `metadata.hasData: false`.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. In `apps/web/src/app/matchups/[leagueId]/[week]/[matchupId]/page.tsx:73`,
     the current destructure is
     `const { data: timeSeriesData, isLoading: timeSeriesLoading } = useMatchupTimeSeries(...)`.
     Add `error: timeSeriesError` (or `isError: timeSeriesIsError`) to the
     destructure — `useMatchupTimeSeries`
     (`apps/web/src/features/matchups/hooks/useMatchupTimeSeries.ts`) already
     returns this via `useQuery`, it's simply not read today.
  2. At both chart render sites (currently lines 312-329 and 342-359 in
     `page.tsx`, the Win Probability and Score Over Time cards), change the
     conditional chain from
     `timeSeriesLoading ? <loading /> : timeSeriesData?.series?.length ? <chart /> : <"not yet available">`
     to a three-way branch: loading → loading UI; `timeSeriesError` (or
     `timeSeriesData?.metadata.hasData === false` combined with a genuine fetch
     error) → an error state distinct from the empty state; otherwise (fetch
     succeeded, `series.length === 0`) → the existing "Live data not yet
     available" copy, which is accurate for that case.
  3. Add a small error-state presentation (reuse the existing
     `text-center text-sm text-muted-foreground` card-content pattern already
     used for the empty state, with different copy, e.g. "Couldn't load
     win-probability data" plus a retry affordance if one is cheap to add).
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web test` for the matchup detail page/hook
  - Manual: force the API route
    (`apps/web/src/app/api/matchup-timeseries/[leagueId]/[week]/[matchupId]/route.ts`)
    to return a 500 (e.g. by temporarily throwing before the DB call) and
    confirm the page shows the new error state, not the "not yet available"
    empty-state copy; then restore and confirm a real empty series (a
    week/matchup with no live samples yet) still shows the original copy

### Design Decisions

- **Approach**: surface the hook's existing `error`/`isError` state at the two
  chart render sites; no API or hook signature change needed —
  `metadata.hasData` and the query's own `error` field already carry the
  distinction, they're just discarded in the view today.
- **Files to modify**:
  `apps/web/src/app/matchups/[leagueId]/[week]/[matchupId]/page.tsx`
- **Patterns to follow**: the existing conditional-render chain at
  `page.tsx:312-329`/`342-359` (keep the same three-branch shape, just add the
  error branch); `useMatchupTimeSeries.ts:58-77`'s `useQuery` already exposes
  `error`

### Risk Assessment

- **Blast radius**: low — isolated to two conditional render branches on one
  page; no data-fetching logic changes.
- **Affected areas**: `/matchups/[leagueId]/[week]/[matchupId]` only.
- **Rollback**: standard revert.

### Implementation Notes

- Depends on nothing else in this backlog.
- The API route (`api/matchup-timeseries/.../route.ts:62-65`) already catches
  its own errors and returns a JSON `{ error: ... }` body with a 500 status,
  which is what makes `res.ok` false and causes `useMatchupTimeSeries` to throw
  (`useMatchupTimeSeries.ts:64-65`) — that thrown error is what `react-query`'s
  `error` field will carry.

### Test Strategy

- **Guardrails**: the existing empty-state ("Live data not yet available")
  behavior must be preserved for a genuine empty-but-successful response.
- **New functionality**: a test asserting a failed `useMatchupTimeSeries` query
  renders the new error copy, distinct from the empty-state copy.
- **Regression check**: the loading state and the populated-chart state must
  render unchanged.

### Acceptance Criteria

- [ ] A failed time-series fetch renders a distinct error message, not "Live
      data not yet available"
- [ ] A successful fetch with an empty series still renders "Live data not yet
      available"
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Any change to the API route's response shape or the `metadata.hasData`
  contract itself.
- Retry/backoff behavior beyond what `react-query`'s defaults already provide.

---

<a id="brief-4-streaming-fallbacks"></a>

## 4. Streaming fallbacks

### Summary

`/managers`, `/managers/[ownerId]`, `/team/[id]`, `/team/[id]/stats`, and
`/archive/2025/stats` build as server-rendered-on-demand routes (`λ`) with no
`loading.tsx`, so the previous route stays fully on screen until the server
responds, with no streaming/skeleton feedback.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. For each of the five routes, add a `loading.tsx` in the same directory as
     `page.tsx`: `apps/web/src/app/managers/loading.tsx`,
     `apps/web/src/app/managers/[ownerId]/loading.tsx`,
     `apps/web/src/app/team/[id]/loading.tsx`,
     `apps/web/src/app/team/[id]/stats/loading.tsx`,
     `apps/web/src/app/archive/2025/stats/loading.tsx`.
  2. Every `loading.tsx` should render
     `<WarRoomLoader show logo={<GauntletLogo size="lg" />} />` (the shared
     loading pattern `ROADMAP.md`'s stale-loader audit already standardized
     across `live`, `start-sit`, `team/[id]` client-side loading states —
     `@gauntlet/ui`'s `WarRoomLoader` and
     `apps/web/src/components/gauntlet-logo.tsx`'s `GauntletLogo`).
  3. `/competition/reports/[season]/[slug]/loading.tsx` (added in Phase 1) is
     the direct App Router precedent for what a `loading.tsx` in this codebase
     looks like structurally — check it before writing the new ones.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web build` — confirm the five routes still build as
    `λ` with the new `loading.tsx` present in the route table
  - Manual: throttle network in devtools (or add an artificial delay locally)
    and confirm each of the five routes shows the loader immediately on
    navigation instead of the previous page staying static

### Design Decisions

- **Approach**: add `loading.tsx` App Router convention files; no data-fetching
  or Suspense-boundary change needed beyond what Next's file convention already
  provides for a `λ` route.
- **Files to create**: the five `loading.tsx` files listed above
- **Patterns to follow**:
  `apps/web/src/app/competition/reports/[season]/[slug]/loading.tsx`
  (structure); `WarRoomLoader`/`GauntletLogo` usage in
  `apps/web/src/app/team/[id]/page.tsx:46` (the existing client-side loading
  branch for `/team/[id]`, which this brief makes redundant once the route-level
  `loading.tsx` exists — decide during implementation whether to keep both or
  let the route-level one supersede the in-component one)

### Risk Assessment

- **Blast radius**: low — additive files only, no existing render logic changed
  except the possible removal of `/team/[id]`'s redundant in-component loading
  branch.
- **Affected areas**: `/managers`, `/managers/[ownerId]`, `/team/[id]`,
  `/team/[id]/stats`, `/archive/2025/stats`.
- **Rollback**: standard revert.

### Implementation Notes

- Depends on nothing else in this backlog.
- `/managers/[ownerId]`'s `not-found.tsx` (added by item 1, if that brief lands
  first) and `loading.tsx` (added by this brief) are independent files and can
  land in either order.

### Test Strategy

- **Guardrails**: no existing page test should regress — a `loading.tsx` file
  doesn't change a page component's own rendering contract.
- **New functionality**: none required beyond a build check that the file exists
  and is picked up by the route table (`○`/`λ` markers), since `loading.tsx` has
  no meaningful unit-testable logic of its own.
- **Regression check**: confirm the five routes' actual content still renders
  correctly once loaded (not just the loading state).

### Acceptance Criteria

- [ ] All five routes show `WarRoomLoader` immediately on navigation before
      server data resolves
- [ ] `pnpm build` succeeds with the new files present
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Any change to what each page fetches or how.
- Adding `loading.tsx` to routes not named in this brief.

---

<a id="brief-5-retire-static-week-pages"></a>

## 5. Static week pages shadowing the dynamic report route

### Summary

`/competition/reports/2025/week-1` through `week-4` are hand-built static pages
that duplicate URLs already served by the dynamic `[season]/[slug]` route. Phase
2's build-output investigation confirmed the dynamic route wins in practice (its
`generateMetadata` output is what actually ships), so the four static pages are
dead weight that still ship their own bundles (11.5–30.2 kB each).

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. Confirm again at implementation time (builds can drift) that
     `.next/server/app/competition/reports/2025/week-2.html` still carries the
     dynamic route's `generateMetadata` title, per §5 Phase 2's verification:
     `<title>Week 2 Report — 2025 | Gauntlet Fantasy Football</title>`, produced
     by `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`, not by
     the static page.
  2. Delete `apps/web/src/app/competition/reports/2025/week-1/`, `week-2/`,
     `week-3/`, `week-4/` (each containing a `page.tsx` and whatever colocated
     files exist).
  3. Rebuild and confirm all eight report URLs (`week-1` through the latest
     published week) still resolve correctly and serve the dynamic route's
     metadata, since the prerender manifest already attributed all eight to
     `srcRoute: /competition/reports/[season]/[slug]` before this change —
     deleting the shadow pages should be a no-op for served content.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web build` — confirm `week-1`…`week-4` no longer
    appear as their own route-table entries (only the `●` SSG group under
    `/competition/reports/[season]/[slug]` should list them)
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `next start`, then `curl` all eight `/competition/reports/2025/week-N` URLs
    and confirm 200 status and the dynamic route's `<title>` on each
  - `pnpm --filter @gauntlet/web test -- sitemap` — the sitemap's assertions
    about report URLs must still pass unchanged, since the sitemap already
    sources report URLs from the same loader the dynamic route uses

### Design Decisions

- **Approach**: delete the four static page directories; the dynamic route
  already serves the same URLs correctly with more accurate metadata.
- **Files to delete**: `apps/web/src/app/competition/reports/2025/week-1/`,
  `apps/web/src/app/competition/reports/2025/week-2/`,
  `apps/web/src/app/competition/reports/2025/week-3/`,
  `apps/web/src/app/competition/reports/2025/week-4/`
- **Patterns to follow**: the precedent of deleting an inert/shadowing route
  segment is exactly what Phase 1 did for the inert `week-[week]` boundary
  directory — same category of cleanup, same verification approach (rebuild,
  confirm nothing breaks).

### Risk Assessment

- **Blast radius**: medium — this removes four page files that currently build
  successfully and serve real content, even if the dynamic route is proven to
  already own those URLs. A build-ordering assumption could be wrong in a way
  this workspace's evidence didn't surface.
- **Affected areas**: `/competition/reports/2025/week-1`…`week-4` only.
- **Rollback**: standard revert; the four deleted directories can be restored
  from git history if the dynamic route is found to not actually serve one of
  the four weeks correctly post-deletion.

### Implementation Notes

- Depends on nothing else in this backlog, but do the confirmation step (1)
  again before deleting — the audit's finding is based on a single build
  snapshot (§5 Phase 2), and build-output ordering was explicitly flagged there
  as not governed by a stated rule.
- `getStaticReportParams`/`loadRecapReport`
  (`apps/web/src/lib/reports/recap/utils/report-loader.ts`) are the loader the
  dynamic route and the sitemap both already use — no change needed to either.

### Test Strategy

- **Guardrails**: `sitemap.test.ts` and any existing report-route tests must
  keep passing.
- **New functionality**: none — this is a deletion, not new functionality.
- **Regression check**: all eight published report URLs must resolve correctly
  post-deletion, confirmed via a real build + `curl` pass, not just unit tests.

### Acceptance Criteria

- [ ] The four static page directories are deleted
- [ ] All eight `/competition/reports/2025/week-N` URLs still return 200 with
      correct content and metadata after a production build
- [ ] `pnpm build` route table no longer lists `week-1`…`week-4` as standalone
      page bundles
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Any change to the dynamic route's own logic, metadata generation, or the
  report loader.

---

<a id="brief-6-per-page-canonical-og-url"></a>

## 6. Per-page canonical and `og:url` ownership

### Summary

Neither `alternates.canonical` nor `openGraph.url` can be set in the root layout
without being wrong on every page that inherits it — a first attempt at setting
`openGraph.url` globally made all 32 pages advertise the home page as their
permanent share URL. The durable route set needs its own per-page values.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. For each durable canonical route (the set in
     `apps/web/src/lib/site.ts:92-99`'s `CANONICAL_STATIC_PATHS`, plus the
     dynamic manager profiles and recap reports the sitemap already covers), add
     `alternates: { canonical: absoluteUrl(path) }` and
     `openGraph: { url: absoluteUrl(path) }` to that route's own `metadata`
     export (static pages) or `generateMetadata` return value (dynamic pages),
     using the existing `absoluteUrl` helper from
     `apps/web/src/lib/site.ts:59-60`.
  2. For `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`, extend
     the existing `generateMetadata` function (which already computes
     `report`/`week`/`season` — see the current early-return shape around lines
     29-45) to include `alternates.canonical` and `openGraph.url` computed from
     the resolved `season`/`slug`.
  3. For `apps/web/src/app/managers/[ownerId]/page.tsx`, add a
     `generateMetadata` export (it currently has none) computing
     `alternates.canonical`/`openGraph.url` from
     `absoluteUrl(`/managers/${ownerId}`)`.
  4. Leave the root layout's `openGraph` block
     (`apps/web/src/app/layout.tsx:26-31`) without a `url` field, as it is today
     — the comment there already explains why.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web build` with `VERCEL_ENV=production`; grep the
    prerendered HTML for `<link rel="canonical"` and `og:url` on several durable
    pages (`/competition`, a recap report, a manager profile) and confirm each
    shows its own URL, not the origin root
  - `pnpm --filter @gauntlet/web test -- robots sitemap` (regression only — this
    brief doesn't touch either file, but both read from `site.ts`)

### Design Decisions

- **Approach**: per-page `metadata`/`generateMetadata` additions using the
  existing `absoluteUrl()` helper; no new shared abstraction, since
  `metadataBase` + per-page relative-or-absolute canonical/og:url is already
  Next's documented pattern and this codebase already partially follows it
  (`generateMetadata` in the recap report route).
- **Files to modify**: every canonical static page under
  `apps/web/src/app/{competition,competition/reports,archive/2025,hall-of-fame-enhanced,managers,privacy}/page.tsx`;
  `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`;
  `apps/web/src/app/managers/[ownerId]/page.tsx`
- **Patterns to follow**:
  `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`'s existing
  `generateMetadata` (source pattern for dynamic-route metadata in this
  codebase); `apps/web/src/lib/site.ts:58-60` (`absoluteUrl`)

### Risk Assessment

- **Blast radius**: medium — touches metadata on every durable canonical page. A
  wrong canonical value is worse than none (Phase 2's own `openGraph.url`
  deviation is the cautionary example), so each page's value must be verified
  against its actual served URL, not assumed.
- **Affected areas**: all durable canonical routes (`CANONICAL_STATIC_PATHS`
  plus dynamic manager/report routes).
- **Rollback**: standard revert.

### Implementation Notes

- **Depends on item 2 (server-side root redirect)** — sequence this after item 2
  lands, because `/`'s own canonicalisation (if `/` keeps any `metadata` at all
  post-redirect) depends on what item 2 decides `/` becomes.
- Some pages in `CANONICAL_STATIC_PATHS` are client components (per §1's
  inventory: `/competition/reports`, `/archive/2025/competition`,
  `/archive/2025/draft-analysis`) and cannot export `metadata` at all — for
  those, canonical/og:url ownership needs a wrapping `layout.tsx`, which
  overlaps with item 7 below. Coordinate the two if picked up by the same
  person; they are still independently shippable (item 7 is scoped to the
  `robots` directive specifically, this item to canonical/`og:url`).

### Test Strategy

- **Guardrails**: `sitemap.test.ts`/`robots.test.ts` must not regress — this
  brief doesn't touch `sitemap.ts`/`robots.ts` directly, only per-page metadata.
- **New functionality**: a test (new or extended) asserting a representative set
  of durable pages emit a canonical URL matching their own path, not the origin
  root.
- **Regression check**: root layout's own `openGraph`/`twitter` defaults must
  still apply to pages that don't override them.

### Acceptance Criteria

- [ ] Every durable canonical page emits its own `<link rel="canonical">` and
      `og:url`, matching its actual URL
- [ ] The root layout continues to omit a global `openGraph.url`
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Client-component-only routes that need a `layout.tsx` to carry metadata at all
  — that mechanism is item 7's scope; this brief covers only routes that can
  already export `metadata`/`generateMetadata` directly.

---

<a id="brief-7-noindex-client-only-routes"></a>

## 7. `noindex` for client-only excluded routes

### Summary

`/competition/preview/*`, `/playground`, `/live`, and `/league/*` are denied in
`robots.txt` but, being client components, cannot export `metadata` and so emit
the inherited `index, follow` directive in the document itself. A `robots.txt`
deny only asks a crawler not to fetch a URL — it does not stop an
already-indexed or externally-linked URL from staying indexed.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. For each affected route family, add a `layout.tsx` in the same directory as
     the client `page.tsx` that exports
     `metadata: { robots: { index: false, follow: false } }` — the wrapping
     layout is itself a Server Component even though the page it wraps is a
     Client Component, so it can export `metadata` on the page's behalf. Route
     families: `apps/web/src/app/competition/preview/2025/week-3/`,
     `apps/web/src/app/playground/`, `apps/web/src/app/live/`,
     `apps/web/src/app/league/overview/`, `apps/web/src/app/league/draft/`,
     `apps/web/src/app/league/transactions/`.
  2. Each new `layout.tsx` should be minimal — export `metadata` only and render
     `children` unchanged, since these routes already get their visual shell
     from the shared `client-layout.tsx`.
  3. Rebuild with `VERCEL_ENV=production` and confirm each route's document now
     emits `<meta name="robots" content="noindex, nofollow">` where it
     previously emitted `index, follow` (§5 Phase 2's build-output check is the
     precedent for how to verify this).
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web build` (`VERCEL_ENV=production`); grep the six
    prerendered/rendered HTML outputs for `name="robots"` and confirm
    `noindex, nofollow` on all six
  - `pnpm --filter @gauntlet/web test -- robots` (regression — `robots.txt`
    itself is unaffected by this brief, only the in-document directive)

### Design Decisions

- **Approach**: one minimal `layout.tsx` per affected route family, each
  exporting only `metadata.robots`. This is the standard Next.js escape hatch
  for giving a Client Component page a metadata contract without converting it
  to a Server Component.
- **Files to create**: six `layout.tsx` files, one per route family listed above
- **Patterns to follow**: `apps/web/src/app/year-in-review/page.tsx:36` and
  `apps/web/src/app/year-in-review/2026-rules/page.tsx:27` for the
  `robots: { index: false, follow: false }` value shape (those are Server
  Component pages that already export this directly; this brief needs the same
  value, just via a wrapping layout instead of the page itself)

### Risk Assessment

- **Blast radius**: low — six new, minimal, additive layout files; no existing
  rendering logic changes.
- **Affected areas**: `/competition/preview/2025/week-3`, `/playground`,
  `/live`, `/league/overview`, `/league/draft`, `/league/transactions`.
- **Rollback**: standard revert.

### Implementation Notes

- Depends on nothing else in this backlog.
- Confirm each new `layout.tsx` doesn't introduce a second `<html>`/`<body>` —
  Next.js route-segment `layout.tsx` files below the root only wrap `children`,
  they don't redeclare the document shell, but verify against this codebase's
  convention (only the root `layout.tsx` currently exists, so there's no
  existing nested-layout example to check against directly — test carefully with
  a real build).

### Test Strategy

- **Guardrails**: `robots.test.ts` must not regress — this brief only changes
  in-document `<meta>` tags, not `robots.txt` itself.
- **New functionality**: a build-output or rendered-HTML test asserting each of
  the six routes emits `noindex, nofollow` in its document.
- **Regression check**: confirm the six routes still render their existing
  content correctly with the new layout wrapper in place.

### Acceptance Criteria

- [ ] All six routes emit `<meta name="robots" content="noindex, nofollow">` in
      their served HTML
- [ ] `robots.txt` itself is unchanged
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Any change to `robots.ts`/`DISALLOWED_PATHS` — those already correctly deny
  these paths; this brief only closes the in-document gap.
- Per-page canonical/`og:url` (item 6) — do not fold into these new layouts
  unless intentionally coordinating both briefs together.

---

<a id="brief-8-open-graph-share-image"></a>

## 8. Open Graph share image

### Summary

`twitter:card` declares `summary_large_image`, but `public/` holds only favicons
and a 180px Apple touch icon — no 1200×630 share asset, so social unfurls render
text-only.

### Autocomplete Readiness

- **Autocomplete-ready**: no
- **If no, why**: this needs a designed 1200×630 image asset (brand/crest
  treatment, on-brand colors and typography) before any code change is possible.
  It is design work, not a code change, and no such asset exists in the
  repository today (`apps/web/public/` listing confirms only favicons and the
  Apple touch icon).

### Design Decisions

- **Approach** (once the asset exists): add the image to `apps/web/public/`
  (e.g. `og-image.png`, 1200×630), then add `openGraph.images` and
  `twitter.images` to the root `metadata` export in
  `apps/web/src/app/layout.tsx` so it applies as the default for every page that
  doesn't override it, and add a route-specific override on
  `/competition/reports/[season]/[slug]`'s `generateMetadata` if a per-report
  image (e.g. featuring that week's headline stat) is ever desired — out of
  scope for the first pass.
- **Files to modify** (once unblocked): `apps/web/src/app/layout.tsx`
- **Files to create** (once unblocked): the image asset itself under
  `apps/web/public/`
- **Patterns to follow**: `apps/web/src/app/layout.tsx:26-35`'s existing
  `openGraph`/`twitter` metadata blocks — add `images` alongside the existing
  fields, following Next's documented `Metadata.openGraph.images`/
  `Metadata.twitter.images` shape.

### Risk Assessment

- **Blast radius**: low, once unblocked — purely additive metadata and a static
  asset.
- **Affected areas**: social unfurls for every page (default) until/unless a
  route overrides it.
- **Rollback**: standard revert.

### Implementation Notes

- Do not fabricate a placeholder asset to "unblock" this brief — a low-quality
  or generic placeholder share image is worse than none, per the same reasoning
  Phase 2 applied to `openGraph.url` (shipping something wrong is worse than
  shipping nothing).
- Coordinate with whoever owns the site's visual design work (`ROADMAP.md`'s
  Phase 6 visual-identity work is the natural owner) before scheduling this
  brief.

### Test Strategy

- **Guardrails**: N/A until unblocked.
- **New functionality** (once unblocked): a test asserting `openGraph.images`
  and `twitter.images` are present and resolve to a real file under `public/`.
- **Regression check**: N/A.

### Acceptance Criteria

- [ ] A 1200×630 share image asset exists under `apps/web/public/`
- [ ] `openGraph.images`/`twitter.images` are set in the root metadata
- [ ] A representative page's rendered HTML includes the image URL in its
      `og:image`/`twitter:image` tags
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Per-report or per-route dynamic share images (e.g. generated via `next/og`) —
  a first pass should ship one static default image.

---

<a id="brief-9-jsonld-and-llms-txt"></a>

## 9. JSON-LD and `llms.txt`

### Summary

No JSON-LD structured data (`Organization`/`WebSite`/`Article`) exists anywhere
in the app, and no `/llms.txt` agent-discovery document exists. Both were
deliberately deferred by the design discussion until the content model is
durable; this brief exists so the deferral stays visible and actionable rather
than silently dropped.

### Autocomplete Readiness

- **Autocomplete-ready**: yes, for a minimal first pass; no, for full coverage
- **If yes, implementation steps** (minimal first pass):
  1. Add `Organization`/`WebSite` JSON-LD to the root layout
     (`apps/web/src/app/layout.tsx`) via a `<script type="application/ld+json">`
     tag rendered in the `<body>`, using `SITE_NAME`/`SITE_ORIGIN` from
     `apps/web/src/lib/site.ts` as the source of truth so it can't drift from
     the rest of the site's identity metadata.
  2. Add `Article` JSON-LD to
     `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`'s
     `generateMetadata` output (or as a script rendered by the page itself),
     using the report's title, publish date, and description — the same data
     `generateMetadata` already computes for the page's own `<title>`/
     `description`.
  3. Add `apps/web/src/app/llms.txt/route.ts` (an App Router Route Handler
     returning `text/plain`) describing the public product and pointing at the
     sitemap, following the same "generated, not static" reasoning `robots.ts`
     already uses — this keeps it from drifting out of sync with the real route
     set.
  4. Add both to `apps/web/src/lib/site.ts`'s `CANONICAL_STATIC_PATHS` set or
     equivalent, if `/llms.txt` should be linked from `robots.ts` the way the
     sitemap URL already is.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `pnpm --filter @gauntlet/web build`; validate the emitted JSON-LD against
    Google's Rich Results structured-data validator or a local JSON-LD parser
    for schema correctness
  - `curl localhost:PORT/llms.txt` returns 200 `text/plain` with the expected
    content
- **If no, why** (for full JSON-LD coverage across every content type, and a
  fully fleshed-out `llms.txt` beyond a minimal route list): the design
  discussion explicitly deferred this "until content and policy are established"
  — a complete implementation needs a decision about which content types get
  which schema.org types beyond the three named, which is a content-modeling
  question, not a pure code change.

### Design Decisions

- **Approach**: minimal `Organization`/`WebSite`/`Article` JSON-LD plus a
  generated `/llms.txt`, both sourced from `site.ts` to avoid drift; full
  coverage deferred per the design discussion.
- **Files to modify**: `apps/web/src/app/layout.tsx`,
  `apps/web/src/app/competition/reports/[season]/[slug]/page.tsx`
- **Files to create**: `apps/web/src/app/llms.txt/route.ts`
- **Patterns to follow**: `apps/web/src/app/robots.ts` (generated-not-static
  reasoning); `apps/web/src/lib/site.ts` (single source of identity/origin
  facts)

### Risk Assessment

- **Blast radius**: low — additive metadata and one new route handler; no
  existing rendering logic changes.
- **Affected areas**: `/`, `/competition/reports/*` (JSON-LD); `/llms.txt` (new
  route).
- **Rollback**: standard revert.

### Implementation Notes

- Depends on nothing else in this backlog.
- Keep the JSON-LD `Organization`/`WebSite` block honest — do not invent fields
  (e.g. `sameAs` social profile links) that don't correspond to a real, linked
  account.

### Test Strategy

- **Guardrails**: none of the existing metadata tests should regress.
- **New functionality**: a test asserting the root layout emits valid
  `Organization`/`WebSite` JSON-LD, a test asserting a recap report emits valid
  `Article` JSON-LD, and a test asserting `/llms.txt` returns 200 with expected
  content (following `robots.test.ts`'s pattern).
- **Regression check**: N/A — purely additive.

### Acceptance Criteria

- [ ] Root layout emits valid `Organization` and `WebSite` JSON-LD
- [ ] Recap report pages emit valid `Article` JSON-LD
- [ ] `/llms.txt` returns 200 `text/plain` with the expected content
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- JSON-LD for any content type beyond `Organization`/`WebSite`/`Article`.
- A fully-authored `llms.txt` beyond a generated route list plus a short product
  description.

---

<a id="brief-10-admin-empty-secret"></a>

## 10. Admin approval endpoint authorizes on an empty secret

### Summary

`apps/web/src/app/api/year-in-review/proposals/route.ts`'s `PATCH` handler
compares `x-admin-key` to `ADMIN_SECRET_KEY` without requiring either to be
non-empty. If `ADMIN_SECRET_KEY` is ever set to an empty string — the normal
result of creating a dashboard variable and leaving the value blank — a request
carrying an empty `x-admin-key:` header is authorized to approve or unapprove
any proposal. Same bug class Phase 3 already fixed for cron auth, found while
fixing that one.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. In `apps/web/src/app/api/year-in-review/proposals/route.ts:53-57`, replace:
     ```ts
     const adminKey = request.headers.get('x-admin-key');
     if (adminKey !== process.env.ADMIN_SECRET_KEY) {
       return NextResponse.json(
         { ok: false, error: 'Unauthorized' },
         { status: 401 }
       );
     }
     ```
     with a guard that fails closed on an empty/unset secret and rejects an
     empty header, reusing the shape of `requireCronAuth`
     (`apps/web/src/lib/cron-auth.ts:22-35`): trim the configured secret, return
     503 if it's empty/unset (misconfiguration), otherwise compare the header to
     the trimmed secret and require a non-empty match.
  2. Consider extracting a small shared `requireAdminAuth` helper in
     `apps/web/src/lib/` if a second admin-gated endpoint appears later — per
     this codebase's own stated bar ("more than one consumer" — see the design
     discussion's "Route-local, validated public mutations" pattern), a single
     consumer today does not yet clear that bar, so inline the fix in
     `proposals/route.ts` for now rather than introducing a new shared
     abstraction.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - New/extended test (see below) covering: unset `ADMIN_SECRET_KEY` → 503;
    `ADMIN_SECRET_KEY` set to `''` → 503; wrong `x-admin-key` → 401; absent
    header → 401; matching key → the existing update behavior proceeds
  - Manual:
    `curl -X PATCH localhost:PORT/api/year-in-review/proposals -H 'x-admin-key: '`
    with `ADMIN_SECRET_KEY` unset must return 503, not 401 with an accidental
    pass-through

### Design Decisions

- **Approach**: fail-closed guard modeled directly on `requireCronAuth`'s policy
  (503 for misconfiguration, 401 for a wrong/absent credential), inlined into
  this route rather than extracted into a shared helper, since this is still the
  only admin-gated endpoint in the codebase.
- **Files to modify**: `apps/web/src/app/api/year-in-review/proposals/route.ts`
- **Patterns to follow**: `apps/web/src/lib/cron-auth.ts` (the exact fail-closed
  shape — trim-and-check-empty before comparing, 503 vs. 401 distinction);
  `apps/web/src/lib/cron-auth.test.ts` (test shape: unset → 503, blank → 503,
  wrong → 401, absent → 401, matching → proceeds)

### Risk Assessment

- **Blast radius**: low — a two-line guard change on one endpoint's `PATCH`
  handler. The smallest brief in this backlog.
- **Affected areas**: `/api/year-in-review/proposals` (PATCH only; `GET`/`POST`
  are unaffected).
- **Rollback**: standard revert.

### Implementation Notes

- Depends on nothing else in this backlog.
- This is the highest-severity of the three Phase 3 security deferrals per the
  audit's own ranking (§3 item 10's framing) precisely because it's the same bug
  class as the cron vulnerability Phase 3 already fixed for real — treat it with
  the same care (verify all three states live via `curl`, the way Phase 3's
  verification record did for cron, not just via unit tests).

### Test Strategy

- **Guardrails**: `GET`/`POST` on `/api/year-in-review/proposals` must be
  unaffected.
- **New functionality**: a test file (e.g.
  `apps/web/src/app/api/year-in-review/proposals/route.test.ts`, or extend one
  if it exists) asserting the five states listed in the verification guide
  above.
- **Regression check**: a valid `x-admin-key` matching a real, non-empty
  `ADMIN_SECRET_KEY` must still successfully approve/unapprove a proposal.

### Acceptance Criteria

- [ ] Unset `ADMIN_SECRET_KEY` → 503, not silently authorized
- [ ] `ADMIN_SECRET_KEY` set to an empty string → 503, not silently authorized
- [ ] Wrong or absent `x-admin-key` → 401
- [ ] Matching non-empty key → proceeds as before
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Extracting a shared `requireAdminAuth` helper — revisit only if a second
  admin-gated endpoint appears.
- Any change to `GET`/`POST` on this route.

---

<a id="brief-11-csp-report-only"></a>

## 11. Content Security Policy, report-only first

### Summary

No Content-Security-Policy header exists anywhere in the app. It was
deliberately excluded from Phase 3's baseline security headers because it is the
one header that can break the app — Vercel Analytics, Speed Insights, the
`next-themes` inline theme script, and Framer Motion's injected styles all need
explicit allowances that can't be derived confidently from reading source alone.
Ship it report-only first, measured against real production traffic.

### Autocomplete Readiness

- **Autocomplete-ready**: no
- **If no, why**: this needs a production deployment to be reachable so a
  `Content-Security-Policy-Report-Only` header's violation reports can be
  collected against real traffic for a release cycle before any directive is
  turned into an enforced policy. This workspace has no access to a production
  deployment or its telemetry (§5's "Blocked checks" table records the same
  constraint for the post-deploy header diff, item 14). The _drafting_ of an
  initial report-only policy is autocomplete-ready; the _validation and
  enforcement_ steps are not, by design.

### Design Decisions

- **Approach** (once a production deployment is reachable): add
  `Content-Security-Policy-Report-Only` to `apps/web/next.config.js`'s
  `securityHeaders()`/`BASELINE_SECURITY_HEADERS` (or a parallel function, since
  this header should ship independently of the already-enforced baseline set),
  enumerating known-required sources: Vercel Analytics (`va.vercel-scripts.com`
  or equivalent, confirm exact host from network trace), Speed Insights
  (`vitals.vercel-insights.com` or equivalent), the `next-themes` inline script
  (`'unsafe-inline'` for `script-src` scoped narrowly, or a nonce/hash if
  feasible), and Framer Motion's injected `<style>` tags (`'unsafe-inline'` for
  `style-src`, since Framer Motion doesn't support CSP nonces for its injected
  styles out of the box). Set a `report-uri`/`report-to` endpoint (a new
  lightweight API route, or a third-party CSP-report collector) to gather
  violations. After a full release cycle of report-only data with no unexpected
  violations, promote to an enforcing `Content-Security-Policy` header.
- **Files to modify** (once unblocked): `apps/web/next.config.js`
- **Files to create** (once unblocked): a report-collection endpoint if a
  third-party collector isn't used, e.g.
  `apps/web/src/app/api/csp-report/route.ts`
- **Patterns to follow**: `apps/web/next.config.js:16-42`'s existing
  `BASELINE_SECURITY_HEADERS`/`securityHeaders()` structure (environment-
  conditional header composition, already established there for HSTS)

### Risk Assessment

- **Blast radius**: high, if enforced without a report-only phase — a CSP
  directive that's too strict can break Analytics, theming, or animation
  silently. Report-only mode itself is zero-risk (it only logs, never blocks).
- **Affected areas**: all routes (the header applies via the same `/:path*`
  catch-all the baseline headers use).
- **Rollback**: standard revert; report-only mode is inherently safe to leave
  running indefinitely if enforcement is deferred further.

### Implementation Notes

- **Depends on a production deployment being reachable** — this is a hard
  blocker, not a sequencing preference, per the audit's own §3 framing for this
  item.
- Do not skip the report-only phase to save time — Phase 3's own reasoning for
  excluding CSP entirely from the baseline set is exactly why this needs
  production measurement before enforcement.

### Test Strategy

- **Guardrails** (once implemented): `security-headers.test.ts` should be
  extended to assert the `Content-Security-Policy-Report-Only` header is present
  with the expected directives, without asserting it blocks anything
  (report-only mode never blocks).
- **New functionality**: a live production check (not a unit test) confirming
  zero unexpected violation reports over a full release cycle before
  enforcement.
- **Regression check**: Analytics, Speed Insights, theme toggling, and Framer
  Motion animations must all continue to function with report-only mode active
  (it should log, not break, anything).

### Acceptance Criteria

- [ ] `Content-Security-Policy-Report-Only` is present on all routes with a
      documented, evidence-based directive set
- [ ] A violation-report collection mechanism exists and receives reports
- [ ] A full release cycle of report-only data shows no unexpected violations
      before any enforcement decision is made
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Enforcing CSP (removing `-Report-Only`) — that is a separate, later decision
  gated on the report-only data itself.
- Any other security header — the baseline set already shipped in Phase 3.

---

<a id="brief-12-public-form-abuse-controls"></a>

## 12. Public-form abuse controls

### Summary

The three Year in Review form endpoints validate submission shape with Zod but
have no rate limiting or bot protection. The three differ in blast radius:
`return-confirmation` and `waitlist` upsert by email (idempotent, bounded by
distinct addresses), while `proposals` creates a new row per POST (an unbounded
insert into the database behind `DATABASE_URL`).

### Autocomplete Readiness

- **Autocomplete-ready**: no
- **If no, why**: choosing a concrete abuse-control mechanism (IP-based rate
  limiting via a store like Upstash Redis/Vercel KV, a CAPTCHA/bot-detection
  service, or a lighter honeypot-field approach) is a product/infra decision the
  design discussion explicitly deferred (Option B: "defer rate limiting, bot
  protection, and other public-form abuse controls to a separate hardening
  slice") without picking a mechanism. It also likely needs a new dependency and
  possibly a new environment variable/secret, which is beyond a self-contained
  code change until that choice is made.

### Design Decisions

- **Approach** (once a mechanism is chosen): whichever mechanism is picked,
  follow the design discussion's own illustrative pattern — a shared
  `verifyPublicSubmission(request)` guard called at the top of each of the three
  `POST` handlers, short-circuiting with a `NextResponse` on rejection, the same
  shape `requireCronAuth` already established for a different concern. The
  design discussion explicitly says not to introduce this abstraction until a
  concrete choice exists — this brief is where that choice gets made and the
  abstraction earns its three real call sites in one step (clearing the "more
  than one consumer" bar immediately, unlike item 10 above).
- **Files to modify** (once unblocked):
  `apps/web/src/app/api/year-in-review/return-confirmation/route.ts`,
  `apps/web/src/app/api/year-in-review/waitlist/route.ts`,
  `apps/web/src/app/api/year-in-review/proposals/route.ts`
- **Files to create** (once unblocked):
  `apps/web/src/lib/verify-public-submission.ts` (or similar), implementing the
  chosen mechanism
- **Patterns to follow**: the design discussion's "Route-local, validated public
  mutations" section (`03-design-discussion-public-web-audit.md`), which shows
  the exact before/after shape expected; `apps/web/src/lib/cron-auth.ts` for the
  "guard returns a short-circuit response or null" convention this codebase
  already uses

### Risk Assessment

- **Blast radius**: medium — touches three live, currently-functioning public
  form endpoints. A too-aggressive rate limit or a broken bot-detection
  integration could block legitimate league members from confirming their
  return, joining the waitlist, or submitting a proposal.
- **Affected areas**: `/year-in-review`'s three form flows (return confirmation,
  waitlist, proposals).
- **Rollback**: standard revert; consider deploying behind a feature flag or
  gradually if the chosen mechanism supports a dry-run/log-only mode first
  (mirroring item 11's report-only-before-enforcing pattern).

### Implementation Notes

- **Size this brief against the asymmetry §2.3 documents**: `proposals` is an
  unbounded insert (highest priority to protect); `return-confirmation` and
  `waitlist` upsert by email (lower urgency, already self-limiting by
  distinct-address count). If the chosen mechanism can't cover all three at once
  cheaply, protect `proposals` first.
- **Item 13 (`Cache-Control` on `league-structure`) can bundle with this brief**
  if item 13 hasn't already landed independently — both touch the Year in Review
  API surface, and item 13 is a one-line addition cheap enough to fold in here.
  Do not block this brief on item 13, or vice versa — they are independently
  shippable; bundling is an efficiency option, not a requirement.
- Depends on nothing else in this backlog for its own scope, beyond the product
  decision noted above.

### Test Strategy

- **Guardrails**: legitimate submissions (within normal rate/behavior bounds)
  must continue to succeed on all three endpoints.
- **New functionality**: tests covering the chosen mechanism's rejection path
  (e.g. rate-limit-exceeded → 429) for at least the `proposals` endpoint.
- **Regression check**: existing Zod validation behavior (400 on invalid shape)
  must be unaffected — the new guard should run before or alongside validation,
  not replace it.

### Acceptance Criteria

- [ ] A concrete abuse-control mechanism is chosen and documented
- [ ] `proposals` (the unbounded-insert endpoint) is protected
- [ ] `return-confirmation` and `waitlist` are protected
- [ ] Legitimate submissions continue to succeed
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Choosing the mechanism is itself part of this brief's scope, but do not expand
  into a general-purpose abuse-control platform for future endpoints not named
  here.

---

<a id="brief-13-cache-control-personal-data"></a>

## 13. `Cache-Control` on personal-data API responses

### Summary

`/api/year-in-review/league-structure` returns submitter names, teams, and
waitlist names, and sends no `Cache-Control` header of its own — confirmed
absent on a live response, not merely unset in source. The endpoint should state
`private, no-store` itself rather than depend on an unpinned platform default.

### Autocomplete Readiness

- **Autocomplete-ready**: yes
- **If yes, implementation steps**:
  1. In `apps/web/src/app/api/year-in-review/league-structure/route.ts`, locate
     the success-path `return NextResponse.json({ ok: true, data: { ... } })`
     (around line 265-289) and the error-path
     `return NextResponse.json({ ok: false, error: ... }, { status: 500 })`
     (around line 291).
  2. Add a `Cache-Control: private, no-store` header to both responses, e.g.
     `NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } })`,
     or set it via `response.headers.set('Cache-Control', 'private, no-store')`
     on the constructed `NextResponse` before returning.
- **If yes, verification guide**:
  - `pnpm --filter @gauntlet/web type-check && pnpm --filter @gauntlet/web lint`
  - `next start`, then
    `curl -sI localhost:PORT/api/year-in-review/league-structure` and confirm
    `cache-control: private, no-store` is present
  - `pnpm --filter @gauntlet/web audit:public-routes -- --base-url=http://localhost:PORT`
    (the same header-sweep script Phase 3 used) to confirm the header shows up
    in the automated sweep too

### Design Decisions

- **Approach**: add the header directly on this route's `NextResponse.json`
  calls; no shared caching-header abstraction needed for a single endpoint.
- **Files to modify**:
  `apps/web/src/app/api/year-in-review/league-structure/route.ts`
- **Patterns to follow**: this codebase already sets response headers explicitly
  in `apps/web/next.config.js`'s `headers()` for the app-wide baseline set —
  this brief is the same idea applied to one route's own response, since
  `Cache-Control` on a single dynamic API response isn't a good fit for the
  global catch-all (other routes may want caching).

### Risk Assessment

- **Blast radius**: low — one header addition to one endpoint's two response
  paths.
- **Affected areas**: `/api/year-in-review/league-structure` only.
- **Rollback**: standard revert.

### Implementation Notes

- **Can bundle with item 12** if that brief hasn't already shipped independently
  — see item 12's Implementation Notes for the reasoning. Do not block on it.
- Depends on nothing else in this backlog for its own scope.

### Test Strategy

- **Guardrails**: the endpoint's existing response body/shape must be unchanged
  — only a header is added.
- **New functionality**: extend or add a test asserting the `Cache-Control`
  header is present on both the success and error response paths.
- **Regression check**: confirm the endpoint's data still resolves correctly for
  both a healthy and a degraded (`.catch()`-fallback) response.

### Acceptance Criteria

- [ ] `/api/year-in-review/league-structure` sends
      `Cache-Control: private,     no-store` on both success and error responses
- [ ] Confirmed live via `curl`, not just asserted in source
- [ ] Tests pass
- [ ] No type/lint errors

### Out of Scope

- Any other API route's caching behavior.
- Any change to the endpoint's data-fetching or response body.

---

<a id="brief-14-post-deploy-header-diff"></a>

## 14. Post-deploy header diff

### Summary

The baseline security headers (Phase 3) and HSTS were shipped with their
compatibility against Vercel's own platform-added headers unverified — the
Vercel MCP server was not authorized in the audit session, so the live
production response headers could not be read and compared against the
configured set. This brief is an operational verification step, not a code
change.

### Autocomplete Readiness

- **Autocomplete-ready**: no
- **If no, why**: this needs access to a real, live production deployment's
  response headers (via `curl -I` against the deployed origin, or the Vercel
  dashboard/CLI/MCP server) to compare against the configured header set in
  `apps/web/next.config.js`. No production deployment was reachable from the
  audit workspace, and this is fundamentally a one-time verification task, not a
  code change — there is nothing to "implement" beyond running the comparison
  and recording the result.

### Design Decisions

- **Approach** (once unblocked): after a deployment with Phase 3's headers is
  live, run `curl -sI https://gauntlet-website.vercel.app/` (and a
  representative API route) and diff the response headers against
  `BASELINE_SECURITY_HEADERS`/`securityHeaders()` in `apps/web/next.config.js`.
  Confirm no header is duplicated (e.g. two `X-Frame-Options` values from both
  the app and the platform) or silently overridden by a platform default. If
  Vercel CLI/MCP access becomes available, `vercel inspect` or an equivalent
  header-listing command can substitute for a raw `curl`.
- **Files to modify**: none, unless the diff surfaces a real conflict — in that
  case, file a new, separate brief for whatever fix the conflict requires rather
  than folding it into this one.

### Risk Assessment

- **Blast radius**: none for the check itself (read-only). If a conflict is
  found, the blast radius of the resulting fix is unknown until then.
- **Affected areas**: all routes (the baseline headers apply site-wide).
- **Rollback**: N/A — this is a verification step.

### Implementation Notes

- Depends on nothing else in this backlog for its own scope, but is inherently
  gated on production deployment access existing, same as item 11.
- This is the one item in this backlog most naturally suited to being run once,
  by hand, immediately after any deployment that includes Phase 3's header
  changes — it does not need its own PR unless a conflict is found.

### Test Strategy

- **Guardrails**: N/A.
- **New functionality**: N/A — this is an evidence-gathering check, not new
  functionality.
- **Regression check**: N/A.

### Acceptance Criteria

- [ ] Live production response headers are captured via `curl` or an equivalent
      tool
- [ ] Each configured header (`X-Content-Type-Options`, `Referrer-Policy`,
      `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`) is
      confirmed present exactly once, with the configured value
- [ ] Any conflict found is recorded and filed as its own follow-up
- [ ] No type/lint errors (N/A if no code changes)

### Out of Scope

- Fixing any conflict this check surfaces — that becomes its own brief once a
  real conflict is identified, since its shape is unknown until then.
