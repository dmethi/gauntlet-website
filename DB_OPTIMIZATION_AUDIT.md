# Database Optimization Audit

## 🔥 Critical Issues Found

### 1. Web App Query Logging (HIGHEST IMPACT)
**File:** `apps/web/src/lib/prisma.ts`
**Problem:** Query logging keeps DB connection active for EVERY request
**Fix:** Remove `log: ['query']` in production

### 2. Long-Running Scripts (HIGH IMPACT)
These scripts keep DB connections open for their entire execution:

| Script | DB Connection Time | Should Be |
|--------|-------------------|-----------|
| `inventory-db.ts` | 1-2 minutes | 5 seconds |
| `data-ingestion/index.ts` | 5-10 minutes | 10 seconds |
| `run-batch-simulations.ts` | 5-10 minutes | 5 seconds |
| `run-live-sims.ts` | 2-5 minutes | 5 seconds |
| `compute-weekly-rollups.ts` | 3-5 minutes | 10 seconds |
| `recover-database.ts` | 10+ minutes | 30 seconds |

### 3. API Routes Pattern (MEDIUM IMPACT)
**Files:** All `apps/web/src/app/api/**/route.ts`
**Problem:** Creating new PrismaClient for each request
**Current Pattern:**
```typescript
const prisma = new PrismaClient()
// do work
await prisma.$disconnect()
```

## ✅ Optimization Strategy

### Quick Wins (Do Today)

1. **Fix Web App Logging:**
```typescript
// apps/web/src/lib/prisma.ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Remove query logging in production!
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
```

2. **Optimize API Routes Pattern:**
```typescript
// Fetch from Sleeper first
const sleeperData = await fetchFromSleeper()

// Process in memory
const results = processData(sleeperData)

// Quick DB write
const prisma = new PrismaClient()
await prisma.results.create({ data: results })
await prisma.$disconnect() // Immediate disconnect!
```

### Medium-Term Fixes

3. **Batch All Script Operations:**
```typescript
// OLD: DB open entire time
async function longScript() {
  const data1 = await prisma.table1.findMany()
  // process...
  const data2 = await prisma.table2.findMany()
  // process...
  await prisma.table3.create(...)
}

// NEW: Batch reads and writes
async function optimizedScript() {
  // Batch read
  const prisma = new PrismaClient()
  const allData = await Promise.all([
    prisma.table1.findMany(),
    prisma.table2.findMany()
  ])
  await prisma.$disconnect()
  
  // Process in memory (no DB!)
  const results = processData(allData)
  
  // Batch write
  const prisma2 = new PrismaClient()
  await prisma2.$transaction([
    prisma2.table3.createMany({ data: results })
  ])
  await prisma2.$disconnect()
}
```

## 📊 Expected Impact

### Current Neon Usage
- **50 hours/month limit**
- **Currently using:** ~25 hours in 2 weeks (on track for 50+)

### After Optimizations
- **Web app:** 90% reduction (remove query logging)
- **Scripts:** 95% reduction (batch operations)
- **Expected usage:** ~5-10 hours/month total

## 🚀 Implementation Priority

1. **TODAY:** Fix web app query logging (1 line change)
2. **TODAY:** Deploy optimized batch-sims script
3. **THIS WEEK:** Refactor top 5 scripts to batch pattern
4. **OPTIONAL:** Consider connection pooling with pgBouncer

## 🎯 Key Principle

**Every DB operation should follow this pattern:**
1. Fetch data from external APIs (Sleeper)
2. Process everything in memory
3. Connect to DB briefly for reads/writes
4. Disconnect immediately

**Never:** Keep DB connection open while processing/waiting/fetching from other APIs!
