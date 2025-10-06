# TODO: Cleanup Old Prisma Implementation

**Priority:** Low (after migration succeeds)  
**Impact:** Code cleanup, remove unused files

---

## Files to Evaluate for Removal

### 1. Old Prisma Schema
**File:** `apps/server/prisma/schema.prisma`

**Status:** Replaced by `schema-historical.prisma`

**Current usage:**
- ❌ Not referenced in `package.json` anymore
- ❌ Not used by any scripts
- ❌ Not used for client generation

**Action:**
```bash
# After migration succeeds, can safely delete:
rm apps/server/prisma/schema.prisma
```

**Keep for now if:**
- Want reference documentation of old structure
- Need to understand historical data model
- Planning to document migration in detail

---

### 2. Old Prisma Client Wrapper
**File:** `apps/server/src/lib/prisma.ts`

**Current content:**
```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// ... singleton pattern ...

export default prisma;
```

**Current usage:**
- ❌ Not imported by background jobs anymore
- ❌ `comprehensive-live-snapshot.ts` uses `historical-data.ts` now
- ✅ Used by `audit-database.ts` (but could be updated)

**Action:**
1. Update `audit-database.ts` to use generated client directly:
```typescript
// Before
import prisma from '../lib/prisma.js';

// After
import { PrismaClient } from '../generated/prisma-historical';
const prisma = new PrismaClient();
```

2. Then delete:
```bash
rm apps/server/src/lib/prisma.ts
```

---

### 3. Old Minimal Schema (Intermediate)
**File:** `apps/server/prisma/schema-minimal.prisma`

**Status:** Intermediate file from earlier refactoring attempt

**Action:**
```bash
# Can safely delete - was never fully adopted
rm apps/server/prisma/schema-minimal.prisma
```

---

### 4. Old Generated Prisma Clients
**Directory:** `apps/server/node_modules/.prisma/`

**Action:**
```bash
# Will be automatically removed when dependencies are reinstalled
# Or force clean:
rm -rf node_modules/.prisma/
npm install  # or pnpm install
```

---

## Recommended Cleanup Sequence

### Phase 1: Post-Migration Verification (Do First)
1. ✅ Apply migration successfully
2. ✅ Verify 3 tables, 3,482 records remain
3. ✅ Test web app works
4. ✅ Test background job (`live-snapshot`) works
5. ✅ Monitor for 24-48 hours in production

### Phase 2: Remove Unused Files (Do After Stability)
```bash
cd apps/server

# Remove old schemas
rm prisma/schema.prisma
rm prisma/schema-minimal.prisma

# Update audit script to use historical client
# (manual edit to src/scripts/audit-database.ts)

# Remove old prisma wrapper
rm src/lib/prisma.ts

# Clean node_modules
rm -rf node_modules/.prisma/
pnpm install
```

### Phase 3: Update References (Final Cleanup)
- [ ] Update any documentation mentioning old schema
- [ ] Update `.cursorrules` if needed
- [ ] Update `DEPLOYMENT_GUIDE.md`
- [ ] Update `README.md` if it mentions database structure

---

## Files to Keep (DO NOT REMOVE)

### ✅ Keep These:
- `apps/server/prisma/schema-historical.prisma` - **Active schema**
- `apps/server/src/lib/historical-data.ts` - **Active utilities**
- `apps/server/src/generated/prisma-historical/` - **Generated client**
- `apps/server/prisma/migrations/` - **Migration history**

---

## Audit Script Update

**File:** `apps/server/src/scripts/audit-database.ts`

**Current:**
```typescript
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import prisma from '../lib/prisma.js';  // ← Uses old wrapper
```

**Update to:**
```typescript
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '../generated/prisma-historical';  // ← Direct import
const prisma = new PrismaClient();
```

**Then add at end:**
```typescript
// Add disconnect at the end
await prisma.$disconnect();
```

---

## Why Keep Old Files Temporarily?

### Reasons to delay cleanup:

1. **Migration Rollback**
   - If migration fails, old schema needed for rollback
   - Keep until 100% confident in new structure

2. **Reference Documentation**
   - Old schema documents full data model
   - Useful for understanding historical decisions
   - Can refer to when building new features

3. **Audit Trail**
   - Shows evolution of database design
   - Helps future developers understand changes
   - Good for documentation purposes

### When to remove:

✅ **Safe to remove after:**
- Migration has been in production for 1+ week
- No rollbacks needed
- All features working correctly
- Team confident in new structure

---

## Commands Summary

```bash
# After migration is stable (1+ week in production):

cd apps/server

# 1. Remove old schemas
rm prisma/schema.prisma
rm prisma/schema-minimal.prisma

# 2. Update audit-database.ts manually
# (change import from '../lib/prisma.js' to '../generated/prisma-historical')

# 3. Remove old wrapper
rm src/lib/prisma.ts

# 4. Verify everything still works
npm run audit:db
npm run live-snapshot  # Test background job

# 5. Clean install
rm -rf node_modules/.prisma/
pnpm install

# 6. Commit cleanup
git add -A
git commit -m "chore: remove old Prisma implementation after successful migration"
```

---

## Estimated Impact

### Cleanup Benefits:
- **~600 lines** of unused schema definitions removed
- **~20 lines** of wrapper code removed
- **Clearer architecture** - only one Prisma client approach
- **Reduced confusion** - developers see only active schema

### Risk Level:
- **Very Low** - old files not referenced anywhere
- **Reversible** - git history preserves everything
- **Non-breaking** - no active code depends on removed files

---

## 📝 Checklist

Before cleanup:
- [ ] Migration applied and stable for 1+ week
- [ ] No production issues
- [ ] Background jobs working correctly
- [ ] Web app functioning normally
- [ ] Team confident in new structure

During cleanup:
- [ ] Remove `schema.prisma`
- [ ] Remove `schema-minimal.prisma`
- [ ] Update `audit-database.ts`
- [ ] Remove `lib/prisma.ts`
- [ ] Clean node_modules
- [ ] Test all scripts still work

After cleanup:
- [ ] Document in git commit message
- [ ] Update team in communication channels
- [ ] Archive this TODO (mission accomplished!)

