# Coding Conventions & Patterns Guide

This document captures the reusable coding patterns, conventions, and architectural decisions from the PrizePicks React Native monorepo. Use this as a reference when setting up similar projects.

---

## Table of Contents

1. [Code Style & Component Patterns](#code-style--component-patterns)
2. [File & Folder Organization](#file--folder-organization)
3. [Import/Export Conventions](#importexport-conventions)
4. [Type System Patterns](#type-system-patterns)
5. [State Management (Jotai)](#state-management-jotai)
6. [API Client Architecture](#api-client-architecture)
7. [Design System Integration](#design-system-integration)
8. [Testing Patterns](#testing-patterns)
9. [Custom ESLint Rules](#custom-eslint-rules)
10. [Package Standards](#package-standards)

---

## Code Style & Component Patterns

### Arrow Functions

Always use arrow functions for components and utilities.

```typescript
// ✅ DO
const MyComponent = (props: MyProps) => {
  // ...
};

const myUtil = (arg: string) => {
  // ...
};

// ❌ DON'T
function MyComponent(props: MyProps) {
  // ...
}
```

### Props Handling

Props are **not** destructured in the function signature. Destructuring must occur on the first line inside the function body.

```typescript
// ✅ DO
const MyComponent = (props: MyProps) => {
  const { name, age } = props;
  // ...
};

// ❌ DON'T
const MyComponent = ({ name, age }: MyProps) => {
  // ...
};
```

**Rationale**: This maintains clarity about what's coming from props vs. derived state, and makes refactoring easier.

### Function Argument Limit

Functions should not have more than two arguments. If three or more are needed, they must be passed as a single arguments object.

```typescript
// ✅ DO
const createUser = (args: { name: string; email: string; age: number }) => {
  // ...
};

// ❌ DON'T
const createUser = (name: string, email: string, age: number) => {
  // ...
};
```

### Component Memoization

To ensure transparency, memoized components should be defined separately and then exported under the original component's name.

```typescript
// ✅ DO
const MyComponent = (props: MyProps) => {
  /* ... */
};
const MyComponentMemo = memo(MyComponent);
export { MyComponentMemo as MyComponent };

// ❌ DON'T
export const MyComponent = memo((props: MyProps) => {
  /* ... */
});
```

**Rationale**: This makes it clear when looking at the codebase that a component is memoized, and allows debugging the non-memoized version if needed.

### Component with forwardRef

When using `forwardRef`, name the function inline for better debugging.

```typescript
export const Button = forwardRef<View, ButtonProps>(
  function Button(props, ref) {
    const { size = 'md', text = '', ...otherProps } = props;
    // ...
  },
);
```

---

## File & Folder Organization

### Monorepo Structure

The project is organized as a Yarn 4 monorepo with workspaces:

```
prizepicks-rn/
├── packages/           # Shared packages
│   ├── api-client/     # API client logic
│   ├── flex-ds/        # Design system
│   ├── utils/          # Shared utilities
│   ├── models/         # Shared models
│   ├── analytics/      # Analytics
│   ├── experiments/    # Feature flags
│   ├── integrations/   # Third-party integrations
│   ├── live/           # Real-time features
│   ├── progression/    # User progression
│   └── shared-ui/      # Shared UI components
├── src/
│   ├── app/            # Expo Router file-based routing
│   ├── game-modes/     # Game mode specific code
│   │   ├── arena/
│   │   ├── culture/
│   │   ├── predict/
│   │   ├── squads/
│   │   └── streak/
│   └── shared/         # Shared application code
│       ├── atoms/      # Global state atoms
│       ├── components/ # Reusable components
│       ├── features/   # Feature modules
│       ├── hooks/      # Reusable hooks
│       ├── layouts/    # Layout components
│       ├── providers/  # React providers
│       ├── test/       # Test utilities & factories
│       ├── types/      # Shared TypeScript types
│       └── utils/      # Utility functions
└── package.json
```

### Feature Module Structure

Each feature follows a consistent folder structure:

```
features/board/
├── atoms.ts              # Feature-specific Jotai atoms
├── components/           # Feature components
│   ├── GameFilter/
│   │   ├── GameFilterSheet.tsx
│   │   ├── GameFilterSheetContent.tsx
│   │   ├── atoms.ts      # Component-specific atoms
│   │   ├── types.ts      # Component-specific types
│   │   └── index.ts      # Barrel export
│   └── index.ts
├── context/              # React contexts
│   └── index.ts
├── hooks/                # Feature-specific hooks
│   └── index.ts
├── layouts/              # Feature layouts
│   └── index.ts
├── screens/              # Screen components
│   └── index.ts
├── utils/                # Feature utilities
│   └── index.ts
└── index.ts              # Exports ONLY screens/layouts
```

### Component Folder Structure

Each component lives in its own folder with supporting files:

```
Button/
├── Button.tsx            # Main component
├── Button.stories.tsx    # Storybook stories
├── Button.test.tsx       # Tests
├── ButtonPressable.tsx   # Sub-components
├── types.ts              # Component types
├── utils.ts              # Component utilities
└── index.ts              # Barrel export
```

### Barrel Exports (index.ts)

Use `index.ts` files to re-export modules for cleaner import paths:

```typescript
// components/Button/index.ts
export * from './Button';
export * from './IconButton';
export type { ButtonProps } from './types';
```

**Important**: Features only export files used by the router (screens and layouts) to prevent cross-feature imports:

```typescript
// features/board/index.ts
/**
 * IMPORTANT: Features only export files that are used by the router (i.e. the src/app).
 * This is almost always only screens and layouts
 * This prevents cross-feature imports.
 * If you need to break this rule you must use eslint-disable statements when you import.
 */
export * from './layouts';
export * from './screens';
```

### Co-location Principle

Global folders should only contain code that is reused in at least two places; otherwise, files should be co-located within their feature directory.

---

## Import/Export Conventions

### Path Aliases

Use absolute imports with aliases over relative imports:

```typescript
// ✅ DO
import { useUser } from '@/shared/hooks';
import { Button } from '@flex-ds/components';
import { GameFactory } from '@/shared/test';

// ❌ DON'T
import { useUser } from '../../../shared/hooks';
```

**Path Alias Configuration** (in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "@/arena/*": ["src/game-modes/arena/*"],
      "@/pickem/*": ["src/game-modes/pickem/*"],
      "@/squads/*": ["src/game-modes/squads/*"],
      "@/streak/*": ["src/game-modes/streak/*"],
      "@/culture/*": ["src/game-modes/culture/*"],
      "@/predict/*": ["src/game-modes/predict/*"],
      "@/shared/*": ["src/shared/*"],
      "@/modules/*": ["./modules/*"]
    }
  }
}
```

### Named Exports vs Default Exports

**Strongly prefer named exports** over default exports.

```typescript
// ✅ DO
export const MyComponent = () => {
  /* ... */
};

// ❌ DON'T
export default MyComponent;
```

**Rationale**: Named exports make refactoring easier, enable better IDE support, and prevent naming inconsistencies.

### Import Order

Organize imports by category (enforced by ESLint):

```typescript
// 1. External dependencies
import { memo, useState } from 'react';
import { View, Text } from 'react-native';

// 2. Internal packages (@prizepicks/*)
import { Button } from '@prizepicks/flex-ds';
import { useUser } from '@prizepicks/utils';

// 3. Absolute imports from app (@/*)
import { useProjections } from '@/shared/hooks';

// 4. Relative imports
import { Header } from './Header';
import type { Props } from './types';
```

### Type-Only Imports

Use `type` keyword for type-only imports:

```typescript
import type { User, UserRole } from '@/shared/types';
import { createUser } from '@/shared/utils';
```

### Unidirectional Dependency Flow

To prevent require cycles, enforce a unidirectional dependency flow:

- ✅ `shared/features/*` **can import from** `shared/components`
- ⛔ `shared/components` **should never import from** `shared/features/*`
- ⛔ `features/board` **should never import from** `features/checkout` (unless explicitly allowed)

---

## Type System Patterns

### Separate Type Files

Types are defined in separate `types.ts` files, not inline with components:

```typescript
// types.ts
export interface ButtonProps extends ButtonPressableProps {
  size: ButtonSize;
  text: string;
  leftIconName?: IconType;
  rightIconName?: IconType;
}

export type ButtonSize = 'md' | 'sm' | 'lg' | 'xs';

// Button.tsx
import type { ButtonProps } from './types';

export const Button = (props: ButtonProps) => {
  // ...
};
```

### Type Export Patterns

Export types explicitly in barrel files:

```typescript
// index.ts
export * from './Button';
export type { ButtonProps, ButtonSize } from './types';
```

### API Type Organization

API types follow a consistent pattern across all endpoints:

```
api/leagues/
├── endpoints.ts    # Endpoint paths as const
├── schemas.ts      # Zod validation schemas
├── types.ts        # TypeScript types
├── enums.ts        # Enums (optional)
└── index.ts        # API definition + exports
```

**Example**:

```typescript
// endpoints.ts
export default {
  get: '/leagues',
  playerInfo: '/v1/leagues/:league_id/players/:player_id',
  games: '/v1/leagues/:league_id/games/:game_id',
} as const;

// types.ts
export interface League {
  id: string;
  name: string;
  active: boolean;
  // ...
}

// schemas.ts
import { z } from 'zod/v4';
import type { League } from './types';

export const leagueSchema: ZodType<League> = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
});

export const getLeaguesResponseSchema = z.array(leagueSchema);

// index.ts
import type { APIDefinition } from '@api-client/client';
import ENDPOINTS from './endpoints';
import { getLeaguesResponseSchema } from './schemas';

export * from './enums';
export * from './schemas';

const definition = {
  endpoints: ENDPOINTS,
  schemas: {
    [ENDPOINTS.get]: {
      get: {
        normalize: true,
        response: getLeaguesResponseSchema,
      },
    },
  },
} as const satisfies APIDefinition<typeof ENDPOINTS>;

export interface LeaguesApi extends typeof definition.schemas {}
export default definition;
```

### Utility Types

Use utility types from `@prizepicks/utils`:

```typescript
import type { WithRequired } from '@prizepicks/utils';

interface BaseProps {
  name?: string;
  age?: number;
}

// Make specific props required
type RequiredNameProps = WithRequired<BaseProps, 'name'>;
```

---

## State Management (Jotai)

### Atom Organization

Atoms are organized by feature in dedicated `atoms.ts` files:

```
shared/atoms/
├── board.ts
├── checkout.ts
├── games.ts
├── location.ts
├── payments.ts
└── index.ts
```

### Atom Naming Convention

Atoms are suffixed with `Atom`:

```typescript
// atoms/board.ts
import { atom } from 'jotai';

export const selectedLeagueAtom = atom<SelectedLeague | null>(null);
export const gameFilterAtom = atom<Record<string, string[]>>({});
```

### Derived Atoms

Use derived atoms for computed state:

```typescript
// Derived atom that computes from other atoms
export const selectedLeagueIdAtom = atom<SelectedLeague['id'] | null>(
  (get) => get(selectedLeagueAtom)?.id ?? null,
);

export const selectedLeagueGameFilterIdsAtom = atom((get) => {
  const selectedLeagueId = get(selectedLeagueIdAtom);
  return get(gameFilterAtom)[selectedLeagueId ?? ''] ?? [];
});
```

### Storage-Backed Atoms

Use utility functions from `@prizepicks/utils` for atoms backed by MMKV storage:

```typescript
import { createBooleanAtomWithStorage } from '@prizepicks/utils';

export const hasSeenPickemOnboardingModalAtom = createBooleanAtomWithStorage({
  key: 'hasSeenPickemOnboardingModal',
  initialValue: false,
  getOnInit: true, // Load from storage on initialization
});
```

**Available storage utilities**:

- `createBooleanAtomWithStorage`
- `createStringAtomWithStorage`
- `createNumberAtomWithStorage`
- `createObjectAtomWithStorage`

### Atom Usage in Components

```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

const MyComponent = () => {
  // Read and write
  const [value, setValue] = useAtom(myAtom);

  // Read only
  const value = useAtomValue(myAtom);

  // Write only (preferred for performance)
  const setValue = useSetAtom(myAtom);

  return <View />;
};
```

---

## API Client Architecture

### Package Structure

The API client is organized by domain:

```
packages/api-client/
├── api/
│   ├── leagues/
│   │   ├── endpoints.ts
│   │   ├── schemas.ts
│   │   ├── types.ts
│   │   ├── enums.ts
│   │   └── index.ts
│   ├── projections/
│   ├── lineups/
│   ├── user/
│   └── index.ts
├── client/
│   ├── prizePicksApi.ts
│   ├── auth/
│   └── index.ts
└── index.ts
```

### API Definition Pattern

Each API domain follows this structure:

1. **endpoints.ts** - Define endpoint paths as `const`:

```typescript
export default {
  get: '/leagues',
  create: '/leagues',
  update: '/leagues/:id',
  delete: '/leagues/:id',
} as const;
```

2. **types.ts** - Define TypeScript interfaces:

```typescript
export interface League {
  id: string;
  name: string;
  active: boolean;
}

export interface CreateLeagueRequest {
  name: string;
}
```

3. **schemas.ts** - Define Zod schemas for runtime validation:

```typescript
import { z } from 'zod/v4';
import type { League } from './types';

export const leagueSchema: ZodType<League> = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
});
```

4. **enums.ts** (optional) - Define enums:

```typescript
export enum LeagueStatus {
  Active = 'active',
  Inactive = 'inactive',
}
```

5. **index.ts** - Export everything and define API:

```typescript
import type { APIDefinition } from '@api-client/client';
import ENDPOINTS from './endpoints';
import { getLeaguesResponseSchema } from './schemas';

export * from './enums';
export * from './schemas';
export * from './types';

const definition = {
  endpoints: ENDPOINTS,
  schemas: {
    [ENDPOINTS.get]: {
      get: {
        normalize: true,
        response: getLeaguesResponseSchema,
      },
    },
  },
} as const satisfies APIDefinition<typeof ENDPOINTS>;

export interface LeaguesApi extends typeof definition.schemas {}
export default definition;
```

### API Client Usage

```typescript
import { api } from '@prizepicks/api-client';

// In a React Query hook
const { data } = useQuery({
  queryKey: ['leagues'],
  queryFn: () => api.leagues.get(),
});
```

---

## Design System Integration

### Design Tokens

Design tokens (colors, spacing, typography) are synced from Figma and integrated into Tailwind configuration.

**Token Categories**:

- **Primitive tokens**: Foundation values (hex codes, pixel values)
- **Semantic tokens**: Purpose-driven (e.g., `bg-dark-disabled`)

### Styling with twrnc

Use Tailwind-like utility classes via `twrnc`:

```typescript
import { tw } from '@prizepicks/flex-ds';

const MyComponent = () => {
  return (
    <View style={tw`bg-neutrals-dark-sofresh-100 p-md rounded-lg`}>
      <Text style={tw`text-neutrals-light-soclean-100 font-bold`}>
        Hello World
      </Text>
    </View>
  );
};
```

**Dynamic styles**:

```typescript
const containerStyle = tw.style(
  'bg-primary-500 p-4',
  isActive && 'bg-primary-700',
  isDisabled && 'opacity-50',
);
```

**Using design tokens directly**:

```typescript
import { color } from '@prizepicks/flex-ds';

<Component color={color.neutrals.light.soclean[180]} />
```

### Component Patterns

Design system components follow consistent patterns:

```typescript
// Separate styled logic from component logic
const styles = {
  btnSize: {
    lg: tw`max-h-11 min-h-11 min-w-20 px-5 py-3`,
    md: tw`max-h-10 min-h-10 min-w-[72px] px-4`,
    sm: tw`max-h-9 min-h-9 min-w-16 px-3`,
    xs: tw`max-h-8 min-h-8 min-w-14 px-3`,
  },
};

export const Button = (props: ButtonProps) => {
  const { size = 'md', ...otherProps } = props;

  return (
    <Pressable style={styles.btnSize[size]} {...otherProps}>
      {/* ... */}
    </Pressable>
  );
};
```

### Icon Usage

Icons are synced from Figma and used via the `Icon` component:

```typescript
import { Icon } from '@prizepicks/flex-ds';

<Icon name="qrCode" size="md" color={color.primary[500]} />
```

**Icon naming**: SVG filename `qr-code.svg` becomes `name="qrCode"` (camelCase).

### Text Variants

Use semantic text variants instead of individual style props:

```typescript
import { Text } from '@prizepicks/flex-ds';

<Text variant="heading-lg">Large Heading</Text>
<Text variant="body-md">Body text</Text>
<Text variant="label-sm">Small label</Text>
```

---

## Testing Patterns

### Test File Location

Test files are co-located with the code they test:

```
components/Button/
├── Button.tsx
├── Button.test.tsx     # Unit tests
├── Button.stories.tsx  # Storybook stories
└── index.ts
```

**Subdirectories for tests**:

```
hooks/
├── useProjections/
│   ├── useProjections.ts
│   ├── __tests__/
│   │   └── useProjections.test.ts
│   └── index.ts
```

### Factory Pattern

Use factory functions to generate test data:

```typescript
// test/factories/game.ts
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import type { Game } from '@prizepicks/api-client';

const DEFAULT_GAME: Game = {
  id: 'GAME_ID',
  start_time: new Date().toISOString(),
  status: 'scheduled',
  // ... all required fields
};

export const GameFactory = {
  generateGame: (overrides: Partial<Game> = {}): Game =>
    _merge(_cloneDeep(DEFAULT_GAME), overrides),
};

// Usage in tests
import { GameFactory } from '@/shared/test';

it('should handle live games', () => {
  const liveGame = GameFactory.generateGame({
    status: 'in_progress',
    is_live: true,
  });

  const result = processGame(liveGame);
  expect(result.isLive).toBe(true);
});
```

### Test Naming Convention

```typescript
describe('getGameInfo', () => {
  it('should return the appropriate GameInfoData object with all data provided', () => {
    // ...
  });

  it('should handle missing away/home team data', () => {
    // ...
  });
});
```

### Test Utilities

Shared test utilities live in `src/shared/test/`:

```
shared/test/
├── factories/
│   ├── game.ts
│   ├── projection.ts
│   ├── lineup.ts
│   └── index.ts
├── jotai.tsx        # Jotai test wrapper
└── index.ts
```

---

## Custom ESLint Rules

The codebase enforces custom ESLint rules to maintain consistency:

### 1. No Cross-Feature Imports

Prevents importing from another feature:

```typescript
// ❌ In features/board/, importing from features/checkout/
import { something } from '@/shared/features/checkout';

// ✅ Import from shared components instead
import { something } from '@/shared/components';
```

**Configuration**:

```javascript
{
  'custom-rules/no-cross-feature-import': [
    'error',
    {
      allowCrossFeature: [
        { from: 'lineups', to: 'checkout' },
        { from: 'lineups', to: 'profile' },
      ],
      ignore: ['\\.stories\\.', '/__tests__/', '\\.test\\.'],
    },
  ],
}
```

### 2. No Cycle

Prevents circular dependencies:

```javascript
{
  'custom-rules/no-cycle': [
    'error',
    { ignore: ['\\.stories\\.', '/__tests__/', '\\.test\\.'] },
  ],
}
```

### 3. Shorter Imports

Warns when you can use a shorter import path:

```typescript
// ⚠️ WARNING
import { Button } from '@/shared/components/Button/Button';

// ✅ Better
import { Button } from '@/shared/components';
```

### 4. Router Rules

Enforces Expo Router file naming and export conventions:

```javascript
{
  'custom-rules/router-rules': [
    'error',
    {
      skipFileNames: [
        'src/app/+html',
        'src/app/index',
      ],
    },
  ],
}
```

### 5. Fix Packages Imports

Auto-fixes package import paths:

```javascript
{
  'custom-rules/fix-packages-imports': 'error',
}
```

### 6. No Raw Text

Ensures all text goes through the `Text` component:

```javascript
{
  'react-native/no-raw-text': [
    'error',
    { skip: ['MarqueeText', 'ListItem', 'ExternalLink'] },
  ],
}
```

---

## Package Standards

### Package Structure

Each package in `packages/*` follows a standard structure:

```
packages/my-package/
├── src/
│   ├── index.ts
│   ├── components/
│   ├── hooks/
│   └── utils/
├── dist/               # Build output
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

### Package.json Structure

```json
{
  "name": "@prizepicks/my-package",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:build": "tsc -b",
    "lint": "eslint . --no-fix --max-warnings=0"
  },
  "dependencies": {
    // Runtime dependencies
  },
  "devDependencies": {
    "typescript": "5.6.3"
  },
  "peerDependencies": {
    // Dependencies expected to be provided by the consuming app
    "react": "*",
    "react-native": "*"
  }
}
```

### Peer Dependencies

Design system and shared packages use peer dependencies to avoid duplication:

```json
{
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "jotai": "*",
    "expo-router": "*"
  }
}
```

### Package Exports

Packages export through a single entry point:

```typescript
// index.ts
export * from './src';

// src/index.ts
export * from './components';
export * from './hooks';
export * from './utils';
export type * from './types';
```

### TypeScript Configuration

Packages use TypeScript project references:

```json
// Root tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "references": [
    { "path": "./packages/analytics" },
    { "path": "./packages/api-client" },
    { "path": "./packages/flex-ds" },
    { "path": "./packages/utils" }
  ]
}
```

### Scripts Consistency

Standard scripts across all packages:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:build": "tsc -b",
    "lint": "eslint . --no-fix --max-warnings=0",
    "format": "prettier --write ."
  }
}
```

---

## Additional Patterns

### Handling Tech Debt

For instances where standards must be bypassed due to time constraints, mark the code with a `// scrappy:` comment:

```typescript
// scrappy: This is a quick fix, needs proper implementation
const quickHack = () => {
  // ...
};
```

**Rationale**: Makes it clear that the code is temporary and intended to be refactored later.

### Formatting & Linting

- **Prettier** formats all code automatically via pre-commit hooks
- **ESLint** enforces code quality; PRs fail if linting issues are found
- Configuration extends `eslint-config-universe` with custom rules

### Code Review & Testing

- All code must pass linting (`yarn lint`)
- Type checking must pass (`yarn typecheck`)
- Tests must pass (`yarn test`)
- Follow existing patterns in the codebase
- Write tests for new features and bug fixes

---

## Quick Reference

### Common Commands

```bash
# Start development server
yarn start

# Run linting
yarn lint

# Type checking
yarn typecheck

# Run tests
yarn test

# Format code
yarn format

# Create new package
yarn new-package
```

### File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useProjections.ts`)
- Utils: `camelCase.ts` (e.g., `formatMoney.ts`)
- Types: `types.ts` in each module
- Tests: `*.test.ts` or `*.test.tsx`
- Stories: `*.stories.tsx`

### Import Path Aliases

- `@/shared/*` → Shared application code
- `@/arena/*` → Arena game mode
- `@/pickem/*` → Pick'em game mode
- `@/culture/*` → Culture game mode
- `@/streak/*` → Streak game mode
- `@/squads/*` → Squads game mode
- `@/predict/*` → Predict game mode
- `@prizepicks/*` → Monorepo packages

---

## Summary

These conventions create a consistent, maintainable codebase by:

1. **Enforcing consistent code style** through ESLint and formatting rules
2. **Organizing code by feature** with clear boundaries and unidirectional dependencies
3. **Using TypeScript strictly** with Zod for runtime validation
4. **Managing state predictably** with Jotai atoms
5. **Structuring APIs consistently** across all domains
6. **Integrating design tokens** from Figma into code
7. **Testing systematically** with factories and co-located tests
8. **Preventing common mistakes** with custom ESLint rules
9. **Standardizing packages** with consistent structure and exports

When setting up a new project, adapt these patterns to your needs while maintaining the core principles of consistency, clarity, and maintainability.
