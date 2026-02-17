---
name: impossible-states
description: Identify and refactor impossible states using discriminated unions
---

# Make Impossible States Impossible

[IMPOSSIBLE STATES MODE ACTIVATED]

## Core Principle

**Impossible states should be unrepresentable in code.**

If your type system allows you to write code that represents an invalid state, you will eventually write that code (or a coworker will). Design your types so invalid states cannot be constructed.

## The Problem Pattern

Multiple boolean flags representing mutually exclusive states:

```typescript
// ❌ BAD: Impossible states are possible
interface Notification {
  message: string;
  isError?: boolean;
  isInfo?: boolean;
  isWarning?: boolean;
}

// This is valid TypeScript but logically impossible:
showNotification({
  message: 'What am I?',
  isError: true,
  isInfo: true,  // Can't be both!
})
```

## The Solution Pattern

Use discriminated unions with a type/kind discriminant:

```typescript
// ✅ GOOD: Impossible states are impossible
type Notification =
  | { type: 'error'; message: string }
  | { type: 'info'; message: string }
  | { type: 'warning'; message: string };

// Now you literally cannot represent both:
showNotification({
  message: 'Clear and safe',
  type: 'info',
})
```

## Detection Rules

Scan code for these anti-patterns:

### 1. Multiple Boolean State Flags
```typescript
// ❌ Anti-pattern
interface RequestState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// ✅ Refactor to
type RequestState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: Data };
```

### 2. Boolean + Optional Data
```typescript
// ❌ Anti-pattern
interface User {
  isGuest: boolean;
  userId?: string;  // Should be required if not guest
  email?: string;   // Should be required if not guest
}

// ✅ Refactor to
type User =
  | { type: 'guest' }
  | { type: 'authenticated'; userId: string; email: string };
```

### 3. Mode Switches with Conflicting State
```typescript
// ❌ Anti-pattern
interface Editor {
  mode: 'edit' | 'view';
  isDirty?: boolean;  // Only relevant in edit mode
  changes?: Change[]; // Only relevant in edit mode
}

// ✅ Refactor to
type EditorState =
  | { mode: 'view'; content: string }
  | { mode: 'edit'; content: string; isDirty: boolean; changes: Change[] };
```

## Workflow

### Step 1: Identify Impossible States

Search for patterns:
- Interfaces/types with 2+ boolean flags that seem related
- Optional fields that should be required in certain states
- Runtime validation that prevents "impossible" combinations
- Comments like "only set X when Y is true"

Use tools:
```bash
# Find multiple boolean props
grep -r "is.*: boolean" --include="*.ts" --include="*.tsx"

# Find state-related interfaces
grep -r "interface.*State\|type.*State" --include="*.ts"
```

### Step 2: Design Discriminated Union

1. Identify all valid states (not combinations of flags)
2. Create union type with discriminant field (type/kind/status/variant)
3. Give each variant only the fields it needs
4. Use exhaustive pattern matching to handle all cases

### Step 3: Update Call Sites

```typescript
// Before
if (notification.isError) {
  showError(notification.message);
} else if (notification.isInfo) {
  showInfo(notification.message);
}

// After - TypeScript narrows the type!
switch (notification.type) {
  case 'error':
    showError(notification.message);
    break;
  case 'info':
    showInfo(notification.message);
    break;
  case 'warning':
    showWarning(notification.message);
    break;
}
```

### Step 4: Leverage Type Narrowing

```typescript
type AsyncData<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

function render<T>(state: AsyncData<T>) {
  // TypeScript knows exactly what fields exist in each branch!
  switch (state.status) {
    case 'loading':
      return <Spinner />;
    case 'error':
      return <ErrorView error={state.error} />;  // state.error exists here
    case 'success':
      return <DataView data={state.data} />;     // state.data exists here
  }
}
```

## Common Patterns

### Async Operations
```typescript
type AsyncState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: E }
  | { status: 'success'; data: T };
```

### Form Validation
```typescript
type FormState<T> =
  | { status: 'editing'; values: Partial<T> }
  | { status: 'validating'; values: T }
  | { status: 'invalid'; values: T; errors: ValidationError[] }
  | { status: 'valid'; values: T };
```

### Authentication
```typescript
type AuthState =
  | { status: 'anonymous' }
  | { status: 'authenticating' }
  | { status: 'authenticated'; user: User; token: string }
  | { status: 'expired'; user: User };
```

### Pagination
```typescript
type PaginationState<T> =
  | { status: 'empty' }
  | { status: 'partial'; items: T[]; hasMore: true; cursor: string }
  | { status: 'complete'; items: T[]; hasMore: false };
```

## Benefits Checklist

When you've successfully refactored:

- [ ] Invalid state combinations are now TypeScript errors
- [ ] Optional fields that were "conditionally required" are now properly typed
- [ ] Pattern matching is exhaustive (TypeScript warns on missing cases)
- [ ] Runtime validation logic has been removed (replaced by compile-time checks)
- [ ] Code is more self-documenting (types show all valid states)
- [ ] Fewer runtime bugs from unexpected state combinations

## Output Format

When analyzing code:

```markdown
## Impossible States Analysis

### Found Issues

#### Issue 1: [Component/Function Name]
**Location:** [file:line]
**Pattern:** Multiple boolean flags
**Invalid State:** [describe what impossible state can occur]

**Current Code:**
[code snippet]

**Refactored:**
[discriminated union solution]

**Impact:** [what errors are now caught at compile-time]

---

### Migration Guide

1. Update type definitions
2. Update constructor/factory functions
3. Update pattern matching (if/switch statements)
4. Remove runtime validation for impossible states
5. Run TypeScript to find remaining issues
```

## Red Flags (Don't Over-Apply)

**DON'T** refactor when:
- Booleans are truly independent (e.g., `isVisible` and `isAnimated` can both be true)
- State is genuinely combinatorial (feature flags, permissions)
- The "impossible state" is actually possible in your domain
- You're just adding complexity without gaining safety

**DO** refactor when:
- You have runtime checks preventing certain combinations
- Documentation says "only set X when Y"
- Code has bugs from unexpected state combinations
- Optional fields should be required in certain modes

## Remember

The goal is **safety through design**, not complexity through types. If the discriminated union feels more confusing than the original, you might not need it. The best refactors make impossible states impossible while making the code clearer and simpler.

**Catch errors at compile-time, not runtime.**
