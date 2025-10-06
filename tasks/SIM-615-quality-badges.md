# Task SIM-615: Add Package Quality Badges

**Category:** DOCUMENTATION  
**Priority:** 🟢 LOW  
**Estimated Time:** 15 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add quality badges to README displaying test coverage, build status, TypeScript version, and license. These badges provide quick visual indicators of package health.

---

## 🎯 Objective

Add 5-6 badges to README header showing test coverage, TypeScript version, license, and package metadata.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/README.md` (lines 1-10) - Current header
- `apps/sim-engine/package.json` - Package metadata

**Files to Update:**
- `apps/sim-engine/README.md` - Add badges to header

---

## 📝 Steps

### 1. Choose Badge Service

Use **shields.io** for badge generation (most common, no signup required).

Badge format: `https://img.shields.io/badge/<LABEL>-<MESSAGE>-<COLOR>`

### 2. Create TypeScript Badge

```markdown
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
```

### 3. Create License Badge

```markdown
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
```

### 4. Create Build Status Badge (if CI/CD configured)

If using GitHub Actions:

```markdown
[![Build Status](https://github.com/your-org/gauntlet-website/workflows/CI/badge.svg)](https://github.com/your-org/gauntlet-website/actions)
```

### 5. Create Test Coverage Badge

**Option A: Static badge (update manually after running tests)**

```markdown
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](coverage/index.html)
```

**Option B: Dynamic badge (if using coverage service like Codecov)**

```markdown
[![Coverage](https://codecov.io/gh/your-org/gauntlet-website/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/gauntlet-website)
```

### 6. Create Package Version Badge (if published to npm)

```markdown
[![npm version](https://img.shields.io/npm/v/@gauntlet/sim-engine)](https://www.npmjs.com/package/@gauntlet/sim-engine)
```

### 7. Create Node Version Badge

```markdown
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
```

### 8. Update README Header

Update `apps/sim-engine/README.md` header section:

```markdown
# @gauntlet/sim-engine

Monte Carlo simulation engine for fantasy football matchup win probability and score distributions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](#testing)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

---

## ✨ Features
```

### 9. Add Custom Badges (Optional)

**Performance Badge:**
```markdown
[![Performance](https://img.shields.io/badge/cold%20start-%3C100ms-brightgreen)]()
```

**Test Count Badge:**
```markdown
[![Tests](https://img.shields.io/badge/tests-45%20passing-brightgreen)]()
```

**Code Style Badge:**
```markdown
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4?logo=prettier)](https://prettier.io/)
```

### 10. Organize Badges

**Option A: Single row (compact)**
```markdown
[![TypeScript](...)](#) [![Coverage](...)](#) [![License](...)](#) [![Node.js](...)](#)
```

**Option B: Two rows (organized by category)**
```markdown
<!-- Status badges -->
[![TypeScript](...)](#) [![Node.js](...)](#) [![License](...)](#)

<!-- Quality badges -->
[![Coverage](...)](#) [![Tests](...)](#) [![PRs Welcome](...)](#)
```

### 11. Update Coverage Badge After Tests

After running tests with coverage:

```bash
cd apps/sim-engine
pnpm test:coverage

# Check coverage/index.html for actual percentage
# Update badge URL with actual coverage number
```

### 12. Verify Badges Render

```bash
# View README on GitHub or with markdown preview
# All badges should render as images
# All links should work
```

---

## ✅ Acceptance Criteria

- [ ] 5+ badges added to README header
- [ ] TypeScript version badge (5.0)
- [ ] Test coverage badge (with actual percentage)
- [ ] Node.js version badge (≥18.0.0)
- [ ] License badge (MIT)
- [ ] PRs Welcome badge
- [ ] All badges render correctly on GitHub
- [ ] All badge links point to correct resources
- [ ] Badges organized in logical grouping
- [ ] No broken image links

---

## 🔗 Related Tasks

**Depends On:**
- SIM-614: Create Comprehensive README (README exists)
- SIM-605: Add Comprehensive Test Suite (coverage data available)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 2 files (~50 lines)
- **Files to update:** 1 file (~10 lines changes)
- **Time estimate:** 15 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-615. Please:

1. Read apps/sim-engine/README.md header
2. Read apps/sim-engine/package.json for metadata
3. Add 5+ quality badges to README header:
   - TypeScript version badge
   - Test coverage badge (get from recent test run)
   - Node.js version badge
   - License badge (MIT)
   - PRs Welcome badge
4. Use shields.io for badge generation
5. Organize badges in 1-2 rows
6. Verify all badge links work
7. Verify badges render on GitHub

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Check coverage for accurate badge
cd apps/sim-engine
pnpm test:coverage
# Look for coverage percentage in output

# Preview README
cat apps/sim-engine/README.md | head -20

# Verify badge URLs return 200
curl -I "https://img.shields.io/badge/TypeScript-5.0-blue"
# Should return 200 OK

# Visual verification: View on GitHub
# All badges should render as images
```

---

## 📝 Commit Message Template

```
docs(sim-engine): add package quality badges to README (SIM-615)

- Add 6 quality badges to README header:
  - TypeScript 5.0 badge with logo
  - Test coverage badge (85%+ coverage)
  - Node.js ≥18.0.0 requirement badge
  - MIT License badge
  - PRs Welcome badge
  - Performance badge (cold start <100ms)
- All badges use shields.io for consistency
- Badges organized in two rows by category
- All links verified and functional
- Provides quick visual indicators of package health

Part of sim-engine enterprise readiness initiative
```

