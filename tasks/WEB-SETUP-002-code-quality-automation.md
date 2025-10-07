# WEB-SETUP-002: Code Quality Automation

**Category**: SETUP  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 45 minutes  
**Dependencies**: None (can run in parallel with WEB-SETUP-001)

---

## Objective

Add ESLint and Prettier configuration matching CODING_CONVENTIONS.MD to enforce arrow functions, explicit return types, import ordering, and consistent code style.

---

## Context Needed

**Read these files**:
1. `apps/web/package.json` (entire file - 63 lines)
2. `apps/server/eslint.config.mjs` (reference implementation - 80 lines)
3. `apps/server/.prettierrc` (reference - 10 lines)
4. `CODING_CONVENTIONS.MD` (lines 820-1042 - ESLint rules section)

**Total Context**: ~200 lines

---

## Steps

### 1. Install ESLint and Prettier Dependencies

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm add -D eslint@8.57.1
pnpm add -D @typescript-eslint/parser@8.38.0 @typescript-eslint/eslint-plugin@8.38.0
pnpm add -D prettier@3.6.2 eslint-config-prettier@9.1.0 eslint-plugin-prettier@5.2.1
pnpm add -D eslint-plugin-react@7.36.1 eslint-plugin-react-hooks@4.6.2
```

### 2. Create ESLint Configuration

Create `apps/web/eslint.config.mjs`:

```javascript
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Testing globals (from vitest)
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Arrow functions enforcement (CODING_CONVENTIONS.MD)
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Import organization
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
    ],
  },
];
```

### 3. Create Prettier Configuration

Create `apps/web/.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 4. Create Prettier Ignore File

Create `apps/web/.prettierignore`:

```
# Dependencies
node_modules/

# Build outputs
.next/
out/
dist/
coverage/

# Data files
src/data/**/*.json
public/**/*.json

# Generated files
*.gen.ts
*.gen.tsx
```

### 5. Create ESLint Ignore File

Create `apps/web/.eslintignore`:

```
# Dependencies
node_modules/

# Build outputs
.next/
out/
dist/
coverage/

# Generated files
*.gen.ts
*.gen.tsx

# Data files
src/data/**/*.json
```

### 6. Update package.json Scripts

Update `apps/web/package.json` scripts section to include lint and format commands:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "precompute": "npx tsx src/scripts/precompute-analytics.ts",
    "precompute:real": "npx tsx src/scripts/precompute-real-analytics.ts",
    "precompute:dev": "npm run precompute && npm run dev",
    "precompute:real-dev": "npm run precompute:real && npm run dev"
  }
}
```

### 7. Run Initial Format

```bash
# Format all files
pnpm format

# Check for violations (will show many - expected)
pnpm lint
```

### 8. Create Pre-commit Hook (Optional)

Create `.husky/pre-commit` (if using husky):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint:fix
pnpm format
pnpm type-check
```

---

## Acceptance Criteria

- [ ] ESLint and Prettier dependencies installed
- [ ] `eslint.config.mjs` created with flat config format
- [ ] `.prettierrc` created with project style guide
- [ ] `.prettierignore` and `.eslintignore` created
- [ ] Scripts added to `package.json` (lint, lint:fix, format, format:check)
- [ ] `pnpm format` runs successfully
- [ ] `pnpm lint` runs (will show violations - expected)
- [ ] ESLint rules match CODING_CONVENTIONS.MD:
  - Arrow functions enforced
  - Explicit return types (warning)
  - Import ordering
  - No-any (warning)
- [ ] React and Next.js rules configured

---

## Verification Commands

```bash
# Check formatting
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm format:check

# Apply formatting
pnpm format

# Check for linting issues (will show many violations initially)
pnpm lint

# Count violations
pnpm lint 2>&1 | grep -c "error"
pnpm lint 2>&1 | grep -c "warning"

# Note: We expect 100+ violations initially
# These will be fixed in WEB-CLEAN-002
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-SETUP-002: Code Quality Automation. Please:

1. Read apps/web/package.json (entire file)
2. Read apps/server/eslint.config.mjs (reference)
3. Read apps/server/.prettierrc (reference)

Then:
4. Install ESLint and Prettier dependencies
5. Create eslint.config.mjs with flat config
6. Create .prettierrc with style guide
7. Create .prettierignore and .eslintignore
8. Update package.json with lint/format scripts
9. Run initial format

Follow the steps in the task file exactly.
```

---

## Related Tasks

**Blocks**:
- WEB-CLEAN-002 (Fix ESLint Violations)
- All refactoring tasks (enforces standards)

**Blocked By**: None

**Related**:
- SETUP-602 (apps/server ESLint setup - reference)
- SIM-601 (sim-engine ESLint setup - reference)
- CODING_CONVENTIONS.MD (defines standards)

---

## Notes

- Initial lint run will show 100+ violations (expected)
- Don't try to fix all violations now - that's WEB-CLEAN-002
- Focus on getting the infrastructure in place
- Many violations are in mega-files that will be split in later tasks
- eslint-disable comments will remain until WEB-CLEAN-002
- Flat config format (eslint.config.mjs) is ESLint 9+ compatible

---

**Estimated Context Usage**: 200 lines read, 150 lines written, 45 minutes total

