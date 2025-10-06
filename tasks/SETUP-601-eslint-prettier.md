# Task: SETUP-601-eslint-prettier

## Overview

Add ESLint and Prettier to `apps/server` for code quality and consistency.

## Context Needed

- Directory: `apps/server/` - Target for linting
- Reference: `apps/web/` - May have existing ESLint config to copy
- File: Root `.eslintrc` or `eslint.config.js` - Workspace config

## Objective

Set up ESLint and Prettier for the server package to enforce TypeScript and
Node.js best practices.

## Steps

### 1. Install Dependencies

```bash
cd apps/server
pnpm add -D \
  eslint@^8 \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### 2. Create `.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off"
  },
  "env": {
    "node": true,
    "es2022": true
  },
  "ignorePatterns": ["dist/", "node_modules/", "src/generated/"]
}
```

### 3. Create `.prettierrc`

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

### 4. Create `.prettierignore`

```
dist/
node_modules/
src/generated/
*.json
pnpm-lock.yaml
```

### 5. Add Scripts to `package.json`

```json
"scripts": {
  "build": "tsc",
  "lint": "eslint src --ext .ts",
  "lint:fix": "eslint src --ext .ts --fix",
  "format": "prettier --write \"src/**/*.ts\"",
  "format:check": "prettier --check \"src/**/*.ts\"",
  ...existing scripts
}
```

### 6. Run Formatter on Existing Files

```bash
pnpm format
```

### 7. Fix Any Linting Issues

```bash
pnpm lint:fix
```

### 8. Verify Clean State

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Acceptance Criteria

- [ ] ESLint installed and configured
- [ ] Prettier installed and configured
- [ ] `.eslintrc.json` created with TypeScript rules
- [ ] `.prettierrc` created with formatting rules
- [ ] `.prettierignore` excludes generated files
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm format:check` passes
- [ ] All 3 TypeScript files formatted
- [ ] `pnpm build` still works
- [ ] No `@typescript-eslint/no-explicit-any` errors (warnings OK)

## Estimated Context Usage

- Files to read: 0 (config from scratch)
- Lines to process: ~100 (config files)
- New files: 3 (.eslintrc.json, .prettierrc, .prettierignore)
- Risk: **Low** (tooling only)

## Related Tasks

- **Blocks**: TEST-601 (good to have linting before tests)

## Cursor Prompt

```
I'm working on SETUP-601. Please:
1. Read tasks/SETUP-601-eslint-prettier.md
2. Install ESLint and Prettier dependencies
3. Create .eslintrc.json, .prettierrc, .prettierignore
4. Add lint and format scripts to package.json
5. Run formatter on all TypeScript files
6. Fix any linting issues
7. Verify lint and build pass
```

## Commit Message

```
feat(SETUP-601): add ESLint and Prettier to apps/server

- Install ESLint with TypeScript plugin
- Install Prettier with ESLint integration
- Create .eslintrc.json with Node.js + TS rules
- Create .prettierrc with formatting config
- Add lint and format scripts to package.json
- Format all existing TypeScript files
- Fix linting issues
```

## Estimated Time

⏱️ **30 minutes**

## Verification

```bash
cd apps/server
pnpm lint           # Should pass
pnpm format:check   # Should pass
pnpm build          # Should work
```

## Notes

- This sets up code quality foundation
- Makes code reviews easier
- Catches common bugs automatically
- Can add pre-commit hooks later (husky)
