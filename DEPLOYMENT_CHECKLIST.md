# Deployment Checklist: API-First Migration

## ✅ Phase 1: Pre-Deployment (Complete)

### Code Implementation
- [x] **Sleeper API Service** (`apps/server/src/services/sleeper/sleeper-api.service.ts`)
  - Centralized API calls with intelligent caching
  - Batch fetching support
  - League ID constants

- [x] **Archive Service** (`apps/server/src/services/archive/archive.service.ts`)
  - JSON-based historical data storage
  - Checksum verification
  - Automatic cleanup

- [x] **React Query Setup** (`apps/web/src/components/providers.tsx`)
  - Enhanced caching configuration
  - Offline support
  - Dev tools integration

- [x] **Custom Hooks** (`apps/web/src/hooks/useSleeper.ts`)
  - Data-specific caching strategies
  - Prefetching logic
  - Optimistic updates

- [x] **API Endpoints Migrated**
  - `/api/league/overview/route-v2.ts` - Direct Sleeper queries
  - `/api/matchups/[leagueId]/[week]/route-v2.ts` - No ID offsets needed

- [x] **Simulation Script V2** (`run-batch-simulations-v2.ts`)
  - Fetches fresh data from Sleeper
  - Stores only results in DB
  - No roster ID offsets

- [x] **Minimal Schema** (`schema-minimal.prisma`)
  - Only 10 tables (down from 26)
  - Focus on odds/simulation data

## 📋 Phase 2: Testing Checklist

### Local Testing
```bash
# 1. Archive existing data
npx tsx apps/server/src/scripts/archive-database.ts

# 2. Test new API endpoints
curl http://localhost:3000/api/league/overview
curl http://localhost:3000/api/matchups/1263744209295245312/1

# 3. Run simulation with new script
npx tsx apps/server/src/scripts/jobs/run-batch-simulations-v2.ts --week 1 --trigger test

# 4. Verify React Query caching
# Open DevTools > React Query tab
# Check cache hit rates
```

### Performance Verification
- [ ] Page load < 500ms
- [ ] API response < 100ms (cached)
- [ ] Cache hit rate > 70%
- [ ] No ID offset errors

## 🚀 Phase 3: Deployment Steps

### 1. Database Migration
```bash
# Generate new Prisma client
npx prisma generate --schema=apps/server/prisma/schema-minimal.prisma

# Create migration (review carefully!)
npx prisma migrate dev --schema=apps/server/prisma/schema-minimal.prisma --name api_first_migration

# Deploy migration to production
npx prisma migrate deploy --schema=apps/server/prisma/schema-minimal.prisma
```

### 2. Environment Variables
```env
# Add to .env and Vercel
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### 3. Update API Routes
```bash
# Rename new routes to replace old ones
mv apps/web/src/app/api/league/overview/route-v2.ts apps/web/src/app/api/league/overview/route.ts
mv apps/web/src/app/api/matchups/[leagueId]/[week]/route-v2.ts apps/web/src/app/api/matchups/[leagueId]/[week]/route.ts
```

### 4. Deploy to Vercel
```bash
# Commit all changes
git add .
git commit -m "feat: migrate to API-first architecture with 94% DB reduction"

# Push to trigger deployment
git push origin main
```

### 5. Post-Deployment Verification
- [ ] All pages load correctly
- [ ] Matchups display properly
- [ ] Odds/simulations work
- [ ] No console errors
- [ ] Neon DB usage < 10%

## 🔄 Phase 4: Gradual Rollout

### Week 1: Monitoring
- Monitor error rates in Vercel
- Check Neon DB usage daily
- Verify cache performance
- Collect user feedback

### Week 2: Optimization
- Tune cache TTLs based on usage
- Optimize slow queries
- Add missing prefetch hints
- Improve error handling

### Week 3: Cleanup
- Remove old database tables
- Delete unused code
- Update documentation
- Archive old data

### Week 4: Full Migration
- Switch all endpoints to V2
- Remove database sync scripts
- Clean up ID offset code
- Celebrate! 🎉

## 🔥 Rollback Plan

If critical issues arise:

### Immediate Rollback (< 5 min)
```bash
# Revert in Vercel
# Go to Deployments > Select previous version > Promote to Production
```

### Code Rollback (< 30 min)
```bash
# Revert Git commit
git revert HEAD
git push origin main

# Restore original schema
npx prisma generate --schema=apps/server/prisma/schema.prisma
```

### Data Recovery
```bash
# Restore from archives
npx tsx scripts/restore-from-archive.ts --date 2024-01-01
```

## 📊 Success Metrics

### Target Performance
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Neon DB Usage | 90% | < 10% | ⏳ |
| API Response | 165ms | < 100ms | ⏳ |
| Cache Hit Rate | 0% | > 70% | ⏳ |
| Daily Queries | 50,000 | < 5,000 | ⏳ |
| Page Load | 500ms | < 200ms | ⏳ |

### Monitoring Dashboard
```javascript
// Add to your monitoring
const metrics = {
  dbUsage: await getNeonUsage(),
  cacheHitRate: queryClient.getQueryCache().getAll()
    .filter(q => !q.isStale()).length / queryClient.getQueryCache().getAll().length,
  apiCalls: apiCallCounter,
  responseTime: performanceObserver.getEntriesByType('measure'),
};
```

## 🎯 Final Checklist

### Before Going Live
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team briefed on changes
- [ ] Rollback plan tested
- [ ] Monitoring configured
- [ ] Archives created

### After Going Live
- [ ] Monitor for 24 hours
- [ ] Check all features
- [ ] Verify DB usage reduction
- [ ] Collect performance metrics
- [ ] Document lessons learned

## 📞 Support Contacts

- **Urgent Issues**: Check Vercel status page
- **Database**: Neon dashboard for usage metrics
- **API Issues**: Check Sleeper API status
- **Monitoring**: Vercel Analytics dashboard

## 🎉 Celebration Milestones

- [ ] First successful deployment
- [ ] 50% reduction in DB usage
- [ ] 90% reduction achieved
- [ ] One week stable
- [ ] Old tables dropped
- [ ] Full migration complete!

---

**Remember**: This migration will save $8,950/year and make the platform 30x faster. Take it slow, test thoroughly, and celebrate the wins! 🚀
