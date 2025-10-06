# Task: SETUP-002 - Test Utilities & Helpers

## Overview
Create reusable test utilities and helper functions to make writing tests easier.

## Context Needed
- File: `apps/web/src/test/setup.ts` - Test setup
- Reference: React Testing Library docs

## Objective
Have reusable test utilities for rendering components with providers and creating mock data.

## Steps

### 1. Create Custom Render Utility
Create `apps/web/src/test/utils/render.tsx`:
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
```

### 2. Create Wait Utilities
Add to `apps/web/src/test/utils/render.tsx`:
```typescript
import { waitFor } from '@testing-library/react';

/**
 * Wait for React Query to finish loading
 */
export async function waitForLoadingToFinish() {
  await waitFor(
    () => {
      const loadingIndicators = document.querySelectorAll('[aria-busy="true"]');
      expect(loadingIndicators).toHaveLength(0);
    },
    { timeout: 3000 },
  );
}
```

### 3. Create Mock Data Utilities
Create `apps/web/src/test/utils/mockData.ts`:
```typescript
/**
 * Generate consistent mock IDs for testing
 */
export function generateMockId(prefix = 'test'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate array of items with factory
 */
export function generateMockArray<T>(
  count: number,
  factory: (index: number) => T,
): T[] {
  return Array.from({ length: count }, (_, i) => factory(i));
}

/**
 * Deep clone object for test isolation
 */
export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```

### 4. Create Test Factory Template
Create `apps/web/src/test/factories/README.md`:
```markdown
# Test Factories

Factories create consistent test data using the Factory pattern.

## Usage

\`\`\`typescript
import { ManagerProfileFactory } from '@/test/factories';

// Create with defaults
const profile = ManagerProfileFactory.create();

// Create with overrides
const profile = ManagerProfileFactory.create({
  manager: 'Test Manager',
  concentration: { giniSpend: 0.5 }
});

// Create many
const profiles = ManagerProfileFactory.createMany(5);
\`\`\`

## Creating New Factories

1. Create file: `factories/[name]Factory.ts`
2. Define DEFAULT_OBJECT with all required fields
3. Implement create() method with lodash merge
4. Add factory-specific helpers
5. Export from index.ts
```

### 5. Create Index File
Create `apps/web/src/test/index.ts`:
```typescript
// Test utilities
export * from './utils/render';
export * from './utils/mockData';

// Factories (add as they're created)
// export * from './factories';
```

### 6. Write Tests for Utilities
Create `apps/web/src/test/utils/mockData.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateMockId, generateMockArray, cloneDeep } from './mockData';

describe('mockData utilities', () => {
  describe('generateMockId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateMockId();
      const id2 = generateMockId();
      expect(id1).not.toBe(id2);
    });

    it('should use prefix', () => {
      const id = generateMockId('user');
      expect(id).toMatch(/^user_/);
    });
  });

  describe('generateMockArray', () => {
    it('should generate array of specified length', () => {
      const arr = generateMockArray(5, (i) => ({ id: i }));
      expect(arr).toHaveLength(5);
    });

    it('should call factory with index', () => {
      const arr = generateMockArray(3, (i) => ({ index: i }));
      expect(arr[0]).toEqual({ index: 0 });
      expect(arr[2]).toEqual({ index: 2 });
    });
  });

  describe('cloneDeep', () => {
    it('should deep clone objects', () => {
      const obj = { a: { b: 1 } };
      const clone = cloneDeep(obj);
      clone.a.b = 2;
      expect(obj.a.b).toBe(1);
    });
  });
});
```

## Acceptance Criteria
- [ ] Custom render utility created
- [ ] Wait utilities created
- [ ] Mock data utilities created
- [ ] Factory template documented
- [ ] Index file exports all utilities
- [ ] Tests for utilities pass
- [ ] Can import from `@/test`

## Estimated Context Usage
- Files to read: 1 (setup.ts for reference)
- Lines to process: ~150
- New files: 5
- Risk: **Low** (new utilities, no changes to existing code)

## Related Tasks
- **Depends on**: SETUP-001
- **Blocks**: All TEST-* tasks (need these utilities)

## Verification
```typescript
// Should work in any test file:
import { render, waitForLoadingToFinish } from '@/test';
import { generateMockId } from '@/test';

const { getByText } = render(<MyComponent />);
const id = generateMockId('test');
```

## Commit Message
```
feat(SETUP-002): add test utilities and helpers

- Add custom render with QueryClient provider
- Add wait utilities for async testing
- Add mock data generation helpers
- Create factory pattern template
- Add tests for utilities
```

## Estimated Time
⏱️ **45-60 minutes**

## Notes
- These utilities will be used in every test
- Keep them simple and focused
- Add more utilities as needs arise
- Document patterns in README

