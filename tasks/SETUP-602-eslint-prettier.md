# SETUP-602: Add ESLint and Prettier Configuration

**Category:** Setup  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 30 minutes  
**Dependencies:** None  
**Blocks:** REFACTOR-601, REFACTOR-602, REFACTOR-603

---

## 📋 Overview

Add ESLint and Prettier to `apps/server` to enforce code conventions and style consistency. This is critical infrastructure that enables automated code quality checks.

---

## 🎯 Objective

Configure ESLint and Prettier for the server package with rules that enforce:
- Arrow function usage
- Named exports only
- Import order
- TypeScript best practices
- Code formatting consistency

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/package.json` (40 lines)
- Root `package.json` for reference (if needed)
- `CODING_CONVENTIONS.MD` (lines 833-932, ESLint rules section)

**Total Context:** ~100 lines

---

## ✅ Steps

### 1. Install Dependencies (5 min)

```bash
cd apps/server
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
```

### 2. Create ESLint Configuration (10 min)

Create `apps/server/eslint.config.mjs`:

```javascript
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Code conventions enforcement
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],
      'no-console': 'warn',
      
      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      
      // Import rules
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      }],
      
      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
```

### 3. Create Prettier Configuration (5 min)

Create `apps/server/.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### 4. Create .eslintignore (2 min)

Create `apps/server/.eslintignore`:

```
node_modules/
dist/
coverage/
src/generated/
*.config.js
*.config.mjs
```

### 5. Add Scripts to package.json (3 min)

Add to `apps/server/package.json` scripts:

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

### 6. Initial Format (5 min)

```bash
cd apps/server
pnpm format
```

---

## ✅ Acceptance Criteria

- [ ] ESLint installed and configured with flat config (eslint.config.mjs)
- [ ] Prettier installed and configured (.prettierrc)
- [ ] .eslintignore created
- [ ] Scripts added to package.json: lint, lint:fix, format, format:check
- [ ] `pnpm lint` runs without crashes (warnings OK for now)
- [ ] `pnpm format:check` runs successfully
- [ ] Configuration files committed

---

## 🔍 Verification

```bash
cd apps/server

# Verify ESLint works
pnpm lint
# Should run without errors (warnings about arrow functions expected)

# Verify Prettier works
pnpm format:check
# Should show which files need formatting

# Format code
pnpm format

# Verify formatting applied
pnpm format:check
# Should show no files need formatting
```

---

## 📊 Estimated Context Usage

- **Files to create**: 3 (eslint.config.mjs, .prettierrc, .eslintignore)
- **Files to modify**: 1 (package.json)
- **Lines to read**: ~100
- **Lines to write**: ~80

---

## 🔗 Related Tasks

**Prerequisites:**
- None (foundation task)

**Enables:**
- REFACTOR-601: Convert to Arrow Functions (will use lint:fix)
- REFACTOR-602: Add Barrel Exports (will validate import paths)
- All code quality tasks

**Related:**
- CLEAN-606: Add JSDoc (completed) - linting will validate JSDoc format

---

## 💡 Cursor Prompt

```
I'm working on SETUP-602 (Add ESLint and Prettier to apps/server).

Please:
1. Read apps/server/package.json
2. Create eslint.config.mjs with flat config format
3. Create .prettierrc with project standards
4. Create .eslintignore
5. Add lint and format scripts to package.json

Follow the steps in tasks/SETUP-602-eslint-prettier.md exactly.

Requirements:
- Use ESLint 9+ flat config format
- Enforce arrow functions (prefer-arrow-callback, func-style)
- Enforce explicit return types
- Ban 'any' types
- Integrate Prettier
```

---

## 📝 Notes

### Why These Rules?

- **prefer-arrow-callback**: Enforces arrow functions per conventions
- **func-style: expression**: Requires `const fn = () => {}` not `function fn() {}`
- **no-console**: Warns about console.log (will be replaced with logger in OBSERVABILITY-601)
- **explicit-function-return-type**: Improves type safety
- **no-explicit-any**: Prevents type safety bypasses

### Expected Warnings After Setup

Running `pnpm lint` will show ~30 warnings for:
- Functions not using arrow syntax → Fix in REFACTOR-601
- Missing return types on some functions
- Console.log usage → Fix in OBSERVABILITY-601

This is expected! We'll fix these in subsequent tasks.

---

## 🎯 Success Metrics

- [ ] Zero linting errors (warnings OK)
- [ ] All files formatted consistently
- [ ] Scripts work without crashes
- [ ] Configuration committed to git
- [ ] Team can run `pnpm lint` successfully

---

**Status:** ⏭️ Ready to Start  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

