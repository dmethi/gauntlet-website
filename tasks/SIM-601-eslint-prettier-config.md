# Task SIM-601: Add ESLint and Prettier Configuration

**Category:** SETUP  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Enable code quality automation for sim-engine by adding ESLint and Prettier configuration. This establishes the foundation for maintaining consistent code style and catching common errors.

---

## 🎯 Objective

Install and configure ESLint with TypeScript support and Prettier formatting to align sim-engine with enterprise code quality standards matching apps/server.

---

## 📂 Context Needed

**Files to Read:**
- `apps/server/eslint.config.mjs` (lines 1-100) - Reference ESLint config
- `apps/server/.prettierrc` (full file) - Reference Prettier config
- `apps/sim-engine/package.json` (lines 1-25) - Current scripts

**Files to Create:**
- `apps/sim-engine/eslint.config.mjs` - ESLint flat config
- `apps/sim-engine/.prettierrc` - Prettier config
- `apps/sim-engine/.prettierignore` - Prettier ignore patterns
- `apps/sim-engine/.eslintignore` - ESLint ignore patterns

---

## 📝 Steps

### 1. Install Dependencies

```bash
cd apps/sim-engine
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 2. Copy ESLint Configuration

Copy `apps/server/eslint.config.mjs` to `apps/sim-engine/eslint.config.mjs` with these adjustments:
- Update files glob to match sim-engine structure: `['src/**/*.ts']`
- Keep all rules (arrow functions, explicit return types, no-any)
- Add Node.js and Web API globals

### 3. Copy Prettier Configuration

Copy `apps/server/.prettierrc` to `apps/sim-engine/.prettierrc` (no changes needed):
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### 4. Create Ignore Files

Create `apps/sim-engine/.prettierignore`:
```
node_modules
dist
coverage
*.json
*.md
```

Create `apps/sim-engine/.eslintignore`:
```
node_modules
dist
coverage
**/*.json
```

### 5. Update package.json Scripts

Add to `apps/sim-engine/package.json`:
```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  }
}
```

### 6. Run Initial Formatting

```bash
pnpm format
pnpm lint
```

---

## ✅ Acceptance Criteria

- [ ] ESLint and Prettier dependencies installed
- [ ] `eslint.config.mjs` created with flat config format
- [ ] `.prettierrc` and `.prettierignore` created
- [ ] Scripts added: `lint`, `lint:fix`, `format`, `format:check`
- [ ] `pnpm format` auto-fixes code style
- [ ] `pnpm lint` runs successfully (may show violations, that's expected)
- [ ] No breaking changes to existing code functionality

---

## 🔗 Related Tasks

**Blocks:**
- SIM-602: Convert All Functions to Arrow Functions (needs linting to identify violations)

**Depends On:** None (foundation task)

---

## 📊 Context Usage

- **Files to read:** 2 files (~150 lines)
- **Files to create:** 4 files (~200 lines)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-601. Please:

1. Read apps/server/eslint.config.mjs
2. Read apps/server/.prettierrc
3. Read apps/sim-engine/package.json (lines 1-25)
4. Install ESLint and Prettier dependencies
5. Create eslint.config.mjs, .prettierrc, .prettierignore, .eslintignore
6. Update package.json with lint and format scripts
7. Run pnpm format and pnpm lint

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify dependencies installed
pnpm list eslint prettier

# Verify scripts work
pnpm lint
pnpm format

# Verify config files exist
ls -la apps/sim-engine/eslint.config.mjs
ls -la apps/sim-engine/.prettierrc
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add ESLint and Prettier configuration (SIM-601)

- Install ESLint 8.57.0 with TypeScript support
- Install Prettier 3.6.2 with ESLint integration
- Create eslint.config.mjs with flat config format
- Create .prettierrc with project style guide
- Add lint, lint:fix, format, format:check scripts
- Foundation for code quality automation complete

Part of sim-engine enterprise readiness initiative
```

