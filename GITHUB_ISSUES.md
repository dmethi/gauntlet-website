# GitHub Issues Roadmap

This document contains GitHub issues for Gauntlet, organized by milestone. Copy
each issue into GitHub Issues to track progress.

---

## Milestone 1: Agent OS & Documentation

**Goal:** Complete the agent-friendly documentation infrastructure.

### Issue 1.1: Create docs/AGENTS.md

**Labels:** `documentation` **Priority:** High

**Description:** Create a dedicated agent operating manual (similar to
friendfund pattern).

**Tasks:**

- [ ] Extract key patterns from `.cursorrules`
- [ ] Add PR checklist
- [ ] Add common task patterns
- [ ] Link to TOPOLOGY, ETHOS, TRADEOFFS

**Acceptance Criteria:**

- [ ] Agents can read one doc and understand how to work
- [ ] Complements (not duplicates) .cursorrules

---

### Issue 1.2: Create docs/runbooks/local-dev.md

**Labels:** `documentation` **Priority:** Medium

**Description:** Create local development setup guide.

**Tasks:**

- [ ] Prerequisites (Node, pnpm, Postgres optional)
- [ ] Step-by-step setup
- [ ] Common commands
- [ ] Troubleshooting section

---

### Issue 1.3: Create docs/runbooks/deployment.md

**Labels:** `documentation` **Priority:** Medium

**Description:** Document deployment process and considerations.

**Tasks:**

- [ ] Vercel deployment steps
- [ ] Environment variables needed
- [ ] Cron job setup
- [ ] Rollback procedures

---

### Issue 1.4: Consolidate Coding Conventions

**Labels:** `documentation`, `cleanup` **Priority:** Low

**Description:** CODING_CONVENTIONS.md and .cursorrules have overlap.
Consolidate.

**Tasks:**

- [ ] Review both files
- [ ] Move principles to ETHOS.md (done)
- [ ] Keep .cursorrules as primary agent guide
- [ ] Refactor CODING_CONVENTIONS.md to examples appendix
- [ ] Or delete if fully redundant

---

## Milestone 2: Code Quality & Testing

**Goal:** Improve test coverage and code quality metrics.

### Issue 2.1: Add Test Coverage Thresholds to CI

**Labels:** `testing`, `infrastructure` **Priority:** High

**Description:** Enforce minimum test coverage for critical modules.

**Targets:**

- `@gauntlet/sim-engine`: 90%
- `features/matchups`: 80%
- `features/stats`: 80%

**Tasks:**

- [ ] Configure Vitest coverage thresholds
- [ ] Add coverage report to CI
- [ ] Document coverage requirements

---

### Issue 2.2: Add Multi-League Safety Tests

**Labels:** `testing`, `critical` **Priority:** High

**Description:** Add dedicated test suite for multi-league data handling.

**Tests needed:**

- [ ] Verify leagues processed separately
- [ ] Verify composite keys used
- [ ] Test ID collision scenarios
- [ ] Test data combination at presentation layer

---

### Issue 2.3: Reduce File Sizes > 700 Lines

**Labels:** `refactoring`, `tech-debt` **Priority:** Medium

**Description:** Identify and split files exceeding size guidelines.

**Tasks:**

- [ ] Audit files > 700 lines
- [ ] Create issues for each file needing split
- [ ] Prioritize by complexity/risk

---

### Issue 2.4: Remove Console.log from Production Code

**Labels:** `cleanup`, `tech-debt` **Priority:** Medium

**Description:** Replace console.log with DEBUG pattern or logger.

**Tasks:**

- [ ] Audit console.log usage
- [ ] Replace with `if (process.env.DEBUG)` pattern
- [ ] Or use logger factory
- [ ] Add lint rule to prevent future additions

---

## Milestone 3: Feature Modules Cleanup

**Goal:** Complete migration to feature-based organization.

### Issue 3.1: Audit Feature Module Completeness

**Labels:** `architecture`, `audit` **Priority:** Medium

**Description:** Verify all features follow the standard structure.

**Expected structure per feature:**

```
features/[name]/
  components/
  hooks/
  utils/
  types.ts (local only, domain types in @gauntlet/types)
  index.ts
```

**Features to audit:**

- [ ] matchups
- [ ] stats
- [ ] draft-analysis
- [ ] playoffs
- [ ] reports

---

### Issue 3.2: Extract Shared Utils to @/shared

**Labels:** `refactoring` **Priority:** Medium

**Description:** Identify utilities used by 3+ features and move to shared.

**Tasks:**

- [ ] Audit feature utils for cross-feature usage
- [ ] Move shared utils to `@/shared/utils/`
- [ ] Update imports
- [ ] Document in shared README

---

### Issue 3.3: Migrate Static JSON to Data Loaders

**Labels:** `refactoring`, `architecture` **Priority:** Low

**Description:** Replace static JSON blobs in `apps/web/data/` with proper data
loaders.

**Tasks:**

- [ ] Identify all static JSON files
- [ ] Create typed data loaders
- [ ] Migrate features to use loaders
- [ ] Remove static JSON

---

## Milestone 4: Simulation Engine

**Goal:** Ensure simulation engine meets performance and accuracy targets.

### Issue 4.1: Verify Simulation Latency < 200ms

**Labels:** `performance`, `critical` **Priority:** High

**Description:** Add performance benchmarks to ensure simulation meets latency
target.

**Tasks:**

- [ ] Add benchmark tests
- [ ] Measure p50, p95, p99 latency
- [ ] Document baseline
- [ ] Add CI check for regression

---

### Issue 4.2: Document Simulation Accuracy

**Labels:** `documentation`, `analysis` **Priority:** Medium

**Description:** Track and document simulation accuracy vs actual outcomes.

**Tasks:**

- [ ] Define accuracy metrics
- [ ] Implement tracking
- [ ] Create accuracy report
- [ ] Identify improvement areas

---

### Issue 4.3: Add Correlation Support (QB-WR Stacks)

**Labels:** `enhancement` **Priority:** Low

**Description:** Enhance simulation to model player correlations (e.g., QB-WR
stacks).

---

## Milestone 5: Reports & Recaps

**Goal:** Improve weekly recap generation.

### Issue 5.1: Document Report Generation Pipeline

**Labels:** `documentation` **Priority:** Medium

**Description:** Document how weekly recaps are generated.

**Tasks:**

- [ ] Document data flow
- [ ] Document Gemini integration
- [ ] Document cron scheduling
- [ ] Add troubleshooting guide

---

### Issue 5.2: Add Report Templates

**Labels:** `enhancement` **Priority:** Low

**Description:** Create reusable templates for different report types.

---

## Milestone 6: Infrastructure

**Goal:** Improve development and deployment infrastructure.

### Issue 6.1: Add Diagram Infrastructure

**Labels:** `documentation`, `infrastructure` **Priority:** Medium

**Description:** Create canonical diagrams for system architecture.

**Diagrams needed:**

- [ ] System architecture (components, data flow)
- [ ] Multi-league processing flow
- [ ] Simulation engine internals
- [ ] Report generation pipeline

**Location:** `docs/diagrams/` **Format:** Mermaid

---

### Issue 6.2: Add Husky Pre-commit Hooks

**Labels:** `infrastructure` **Priority:** Low

**Description:** Ensure quality checks run before commit.

**Hooks:**

- [ ] Lint staged files
- [ ] Type-check
- [ ] Check for secrets

---

### Issue 6.3: Add Dependabot

**Labels:** `infrastructure`, `security` **Priority:** Low

**Description:** Set up automated dependency updates.

---

## Milestone 7: UI & Design

**Goal:** Improve visual design and mobile experience.

### Issue 7.1: Audit Mobile Responsiveness

**Labels:** `ui`, `audit` **Priority:** Medium

**Description:** Verify all pages work well on mobile devices.

**Tasks:**

- [ ] Test all pages on mobile viewport
- [ ] Identify layout issues
- [ ] Create issues for fixes

---

### Issue 7.2: Implement Design Tokens

**Labels:** `ui`, `design-system` **Priority:** Low

**Description:** Ensure `@gauntlet/tokens` is fully implemented.

---

## Summary

| Milestone          | Issues | Priority    |
| ------------------ | ------ | ----------- |
| 1. Agent OS        | 4      | High        |
| 2. Code Quality    | 4      | High/Medium |
| 3. Feature Modules | 3      | Medium      |
| 4. Simulation      | 3      | High/Medium |
| 5. Reports         | 2      | Medium/Low  |
| 6. Infrastructure  | 3      | Medium/Low  |
| 7. UI & Design     | 2      | Medium/Low  |

**Target:** 9.0/10 enterprise hygiene score (from 3.5/10)

**Recommended order:**

1. Milestone 1 (Agent OS) - Enable better AI collaboration
2. Milestone 2 (Code Quality) - Foundation for safe changes
3. Milestone 4 (Simulation) - Core value delivery
4. Remaining milestones based on priority
