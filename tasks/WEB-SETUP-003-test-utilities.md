# WEB-SETUP-003: Test Utilities and Factories

**Category**: SETUP  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 1 hour  
**Dependencies**: WEB-SETUP-001 (Testing Infrastructure)

---

## Objective

Create test utilities and data factories to enable efficient, consistent test writing across all components and utilities.

---

## Context Needed

**Read these files**:
1. `apps/web/src/lib/hooks.ts` (lines 1-100 - for type examples)
2. `apps/web/src/components/manager-analysis.tsx` (lines 46-50 - for type examples)
3. `CODING_CONVENTIONS.MD` (lines 740-830 - factory pattern section)

**Total Context**: ~200 lines

---

## Steps

### 1. Create Test Directory Structure

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src
mkdir -p test/factories
mkdir -p test/utils
```

### 2. Create React Query Test Wrapper

Create `apps/web/src/test/utils/test-wrapper.tsx`:

```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

/**
 * Creates a new QueryClient for each test
 * Prevents test pollution from cached queries
 */
const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Test wrapper with React Query provider
 */
export const createWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createTestQueryClient();
  
  return ({ children }: WrapperProps): JSX.Element => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Custom render function with React Query wrapper
 * 
 * @example
 * ```tsx
 * import { renderWithProviders } from '@/test/utils';
 * 
 * it('renders component', () => {
 *   const { getByText } = renderWithProviders(<MyComponent />);
 *   expect(getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
): ReturnType<typeof rtlRender> => {
  const { queryClient, ...renderOptions } = options || {};
  
  return rtlRender(ui, {
    wrapper: createWrapper(queryClient),
    ...renderOptions,
  });
};
```

### 3. Create Team Factory

Create `apps/web/src/test/factories/team.ts`:

```typescript
import { FantasyTeam } from '@gauntlet/types';

/**
 * Factory for generating test team data
 */
export const TeamFactory = {
  /**
   * Generate a test team with default or custom values
   */
  generateTeam: (overrides: Partial<FantasyTeam> = {}): FantasyTeam => ({
    roster_id: 1,
    owner_id: 'user_123',
    league_id: 'league_123',
    players: ['player_1', 'player_2', 'player_3'],
    starters: ['player_1', 'player_2'],
    settings: {
      wins: 5,
      losses: 3,
      ties: 0,
      fpts: 1250.5,
    },
    metadata: {
      team_name: 'Test Team',
    },
    ...overrides,
  }),

  /**
   * Generate multiple teams
   */
  generateMultiple: (count: number, overrides: Partial<FantasyTeam> = []): FantasyTeam[] => {
    return Array.from({ length: count }, (_, i) =>
      TeamFactory.generateTeam({
        roster_id: i + 1,
        owner_id: `user_${i + 1}`,
        metadata: {
          team_name: `Team ${i + 1}`,
        },
        ...overrides,
      })
    );
  },
};
```

### 4. Create Matchup Factory

Create `apps/web/src/test/factories/matchup.ts`:

```typescript
/**
 * Factory for generating test matchup data
 */
export const MatchupFactory = {
  /**
   * Generate a test matchup with default or custom values
   */
  generateMatchup: (overrides: Partial<{
    matchup_id: number;
    roster_id: number;
    points: number;
    players_points: Record<string, number>;
    starters_points: number[];
  }> = {}) => ({
    matchup_id: 1,
    roster_id: 1,
    points: 125.5,
    players_points: {
      player_1: 25.5,
      player_2: 18.0,
      player_3: 12.5,
    },
    starters_points: [25.5, 18.0, 12.5, 20.0, 15.0, 10.0, 8.0, 5.0, 4.0],
    ...overrides,
  }),

  /**
   * Generate a complete matchup (both teams)
   */
  generateMatchupPair: (overrides?: {
    team1?: Partial<ReturnType<typeof MatchupFactory.generateMatchup>>;
    team2?: Partial<ReturnType<typeof MatchupFactory.generateMatchup>>;
  }) => {
    const matchup_id = 1;
    return [
      MatchupFactory.generateMatchup({
        matchup_id,
        roster_id: 1,
        points: 125.5,
        ...overrides?.team1,
      }),
      MatchupFactory.generateMatchup({
        matchup_id,
        roster_id: 2,
        points: 118.0,
        ...overrides?.team2,
      }),
    ];
  },
};
```

### 5. Create Manager Analytics Factory

Create `apps/web/src/test/factories/manager.ts`:

```typescript
import { ManagerProfile } from '@/lib/manager-analytics';

/**
 * Factory for generating test manager analytics data
 */
export const ManagerFactory = {
  /**
   * Generate a test manager profile with default or custom values
   */
  generateProfile: (overrides: Partial<ManagerProfile> = {}): ManagerProfile => ({
    manager: 'Test Manager',
    league: 'AFC',
    concentration: {
      giniSpend: 0.45,
      top1_share: 0.25,
      top2_share: 0.40,
      top3_share: 0.55,
      spendHHI: 0.15,
    },
    cluster: {
      cluster_label: 'Stars & Scrubs',
      cluster_description: 'High concentration strategy',
    },
    spendShares: {
      QB: 0.15,
      RB: 0.35,
      WR: 0.30,
      TE: 0.10,
      K: 0.05,
      DEF: 0.05,
    },
    teamStrength: {
      positionScore: 75.5,
      balanceScore: 60.0,
      riskScore: 55.0,
      totalScore: 63.5,
    },
    ...overrides,
  }),

  /**
   * Generate multiple manager profiles
   */
  generateMultiple: (count: number): ManagerProfile[] => {
    return Array.from({ length: count }, (_, i) =>
      ManagerFactory.generateProfile({
        manager: `Manager ${i + 1}`,
        league: i % 2 === 0 ? 'AFC' : 'NFC',
      })
    );
  },
};
```

### 6. Create Mock API Client

Create `apps/web/src/test/utils/mock-api-client.ts`:

```typescript
import { vi } from 'vitest';

/**
 * Mock API client for testing
 * 
 * @example
 * ```typescript
 * import { createMockAPIClient } from '@/test/utils';
 * 
 * it('fetches league data', async () => {
 *   const mockClient = createMockAPIClient({
 *     fetchLeague: vi.fn().mockResolvedValue({ id: '123', name: 'Test League' }),
 *   });
 *   
 *   const result = await mockClient.fetchLeague('123');
 *   expect(result.name).toBe('Test League');
 * });
 * ```
 */
export const createMockAPIClient = (overrides = {}) => ({
  fetchLeague: vi.fn(),
  fetchRosters: vi.fn(),
  fetchMatchups: vi.fn(),
  fetchPlayers: vi.fn(),
  fetchNFLState: vi.fn(),
  ...overrides,
});

/**
 * Mock fetch function with custom responses
 */
export const mockFetch = (responses: Record<string, unknown>) => {
  global.fetch = vi.fn((url: string) => {
    const response = responses[url] || responses['*'];
    
    return Promise.resolve({
      ok: true,
      json: async () => response,
      text: async () => JSON.stringify(response),
      status: 200,
      statusText: 'OK',
    } as Response);
  });
};
```

### 7. Create Barrel Export

Create `apps/web/src/test/index.ts`:

```typescript
// Factories
export * from './factories/team';
export * from './factories/matchup';
export * from './factories/manager';

// Utilities
export * from './utils/test-wrapper';
export * from './utils/mock-api-client';
```

### 8. Create Example Test Using Factories

Create `apps/web/src/test/factories/team.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { TeamFactory } from './team';

describe('TeamFactory', () => {
  describe('generateTeam', () => {
    it('should generate a valid team with defaults', () => {
      const team = TeamFactory.generateTeam();
      
      expect(team.roster_id).toBe(1);
      expect(team.owner_id).toBe('user_123');
      expect(team.players).toHaveLength(3);
      expect(team.metadata.team_name).toBe('Test Team');
    });

    it('should allow overriding default values', () => {
      const team = TeamFactory.generateTeam({
        roster_id: 5,
        metadata: { team_name: 'Custom Team' },
      });
      
      expect(team.roster_id).toBe(5);
      expect(team.metadata.team_name).toBe('Custom Team');
    });
  });

  describe('generateMultiple', () => {
    it('should generate multiple teams with sequential IDs', () => {
      const teams = TeamFactory.generateMultiple(3);
      
      expect(teams).toHaveLength(3);
      expect(teams[0].roster_id).toBe(1);
      expect(teams[1].roster_id).toBe(2);
      expect(teams[2].roster_id).toBe(3);
    });
  });
});
```

---

## Acceptance Criteria

- [ ] Test directory structure created (`test/factories/`, `test/utils/`)
- [ ] `test-wrapper.tsx` created with React Query provider
- [ ] `renderWithProviders` utility works correctly
- [ ] TeamFactory created with `generateTeam` and `generateMultiple`
- [ ] MatchupFactory created with `generateMatchup` and `generateMatchupPair`
- [ ] ManagerFactory created with `generateProfile` and `generateMultiple`
- [ ] Mock API client utilities created
- [ ] Barrel export (`test/index.ts`) created
- [ ] Example test passes
- [ ] All factories follow lodash merge pattern
- [ ] JSDoc documentation added to all exports

---

## Verification Commands

```bash
# Run factory tests
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm test test/factories

# Run all tests
pnpm test

# Verify TypeScript compilation
pnpm tsc --noEmit

# Check that barrel export works
pnpm test --run
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-SETUP-003: Test Utilities and Factories. Please:

1. Read apps/web/src/lib/hooks.ts (lines 1-100) for type examples
2. Read apps/web/src/components/manager-analysis.tsx (lines 46-50) for type examples
3. Read CODING_CONVENTIONS.MD (lines 740-830) for factory pattern

Then:
4. Create test directory structure
5. Create test-wrapper.tsx with React Query provider
6. Create factories: TeamFactory, MatchupFactory, ManagerFactory
7. Create mock API client utilities
8. Create barrel export
9. Create example test using factories

Follow the steps in the task file exactly.
```

---

## Related Tasks

**Blocks**:
- All WEB-TEST-* tasks (need factories for testing)
- WEB-COMP-* tasks (need factories for component tests)

**Blocked By**:
- WEB-SETUP-001 (Testing Infrastructure)

**Related**:
- TEST-601 (apps/server test utilities - reference)
- CODING_CONVENTIONS.MD (factory pattern reference)

---

## Notes

- Factories use lodash merge pattern for easy customization
- React Query wrapper prevents test pollution
- Mock API client enables isolated unit testing
- All factories include JSDoc with examples
- Example test validates factory functionality
- Barrel export enables clean imports: `import { TeamFactory } from '@/test'`

---

**Estimated Context Usage**: 200 lines read, 400 lines written, 1 hour total

