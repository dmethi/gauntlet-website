# AWS Migration Plan

## 🎯 Target Architecture

```
GitHub Actions → AWS EventBridge → Lambda Functions → RDS PostgreSQL
Frontend (Vercel/Netlify) → API Gateway → Lambda Functions
```

## 🚀 Migration Steps

### Phase 1: Move Compute to AWS Lambda

1. **Create Lambda Functions:**
   ```
   gauntlet-live-simulations    (replaces live-odds-updates.yml)
   gauntlet-daily-ingestion     (replaces daily-ingestion.yml)  
   gauntlet-api-endpoints       (replaces Vercel API routes)
   ```

2. **Set up EventBridge Rules:**
   ```
   Every 10 minutes during game windows  → live-simulations
   Daily at 8am ET                      → daily-ingestion
   ```

3. **Database:**
   - Keep existing Neon database ($5/month - already optimized)
   - No migration needed - focus on compute savings

### Phase 2: Optimize Scheduling

4. **Smart Game Detection:**
   - Check actual NFL game status before running expensive operations
   - Skip simulations when no games are active

5. **Consolidated Jobs:**
   - Merge overlapping workflows into single Lambda execution
   - Batch multiple operations to reduce cold starts

### Phase 3: Frontend Options

6. **Option A: Keep Vercel for Frontend Only**
   - Static site generation (free)
   - API calls to AWS Lambda via API Gateway

7. **Option B: Full AWS with S3 + CloudFront**
   - S3 static hosting (free tier: 5GB)
   - CloudFront CDN (free tier: 1TB transfer)

## 💰 Cost Comparison

### Current Vercel (estimated monthly)
- Serverless functions with warm-up penalty: $20-50+
- Database: $0-20 (if using external)
- **Total: $20-70/month**

### AWS Free Tier (first 12 months)
- Lambda: FREE (within 3.2M seconds)  
- EventBridge: FREE (within 14M events)
- RDS: FREE (db.t3.micro)
- S3 + CloudFront: FREE (within limits)
- **Total: $0-5/month**

### AWS After Free Tier (Year 2+)
- Lambda: $0/month (your usage stays within always-free limits)
- API Gateway: $0-2/month (if >1M calls/month)
- RDS: $18/month (ONLY if you migrate database to AWS)
- **Total: $0-2/month** (keeping external DB) or **$18/month** (with RDS)

## 🛠️ Implementation Priority

1. **High Impact**: Move scheduled jobs to Lambda (90% cost reduction)
2. **Medium Impact**: Add smart game detection
3. **Low Impact**: Migrate frontend (can stay on Vercel)

## 🎯 Quick Win: Lambda + EventBridge

Start with just the scheduled jobs:
- Deploy simulation logic to Lambda
- Use EventBridge instead of GitHub Actions cron
- Keep existing database and frontend

This alone should save you 70-90% on compute costs.
