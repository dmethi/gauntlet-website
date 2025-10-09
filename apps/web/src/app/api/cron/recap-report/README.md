# Weekly Recap Report Cron Job

Automated weekly recap report generation using external cron service (cron-job.org).

## Overview

This API endpoint enables automated weekly recap reports every Tuesday at 10am ET (2pm UTC), after Monday Night Football concludes. The system uses Gemini AI to generate narrative content about league performance, matchups, power rankings, and more.

**Cron Service**: cron-job.org (free, reliable external service)  
**Why not Vercel Cron**: More flexibility, better monitoring, no vendor lock-in

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Cron                              │
│                  (Tuesday 10am ET / 2pm UTC)                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   route.ts            │
          │  - Auth check         │
          │  - Error handling     │
          │  - HTTP response      │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   runner.ts           │
          │  - Get current week   │
          │  - Generate report    │
          │  - Save to disk       │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   integration.ts      │
          │  (generateAndSave)    │
          └───────────┬───────────┘
                      │
            ┌─────────┴──────────┐
            ▼                    ▼
    ┌───────────────┐    ┌──────────────┐
    │  generate.ts  │    │  storage/    │
    │  (Gemini AI)  │    │  file-system │
    └───────────────┘    └──────────────┘
```

## Files

### `route.ts`
- **Purpose**: Vercel API route handler for cron endpoint
- **Auth**: Requires `CRON_SECRET` in Authorization header
- **Timeout**: 5 minutes (300 seconds) for AI generation
- **Methods**: 
  - `GET` - Called by Vercel Cron
  - `POST` - Manual triggers

### `runner.ts`
- **Purpose**: Core execution logic for report generation
- **Dependencies**:
  - `@/lib/reports/recap/integration` - Report generation + storage
  - `@/lib/api-replacements` - Current week detection
- **Returns**: Structured result with status, file path, errors

### `README.md` (this file)
- **Purpose**: Documentation and troubleshooting guide

## Configuration

### Environment Variables

Required in Vercel:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
CRON_SECRET=your_random_secret_here
```

### cron-job.org Setup

1. Create free account at https://cron-job.org
2. Create new cron job:
   - **URL**: `https://your-domain.vercel.app/api/cron/recap-report`
   - **Method**: POST
   - **Schedule**: `0 14 * * 2` (Tuesday 2pm UTC / 10am ET)
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Timeout**: 300 seconds

**See**: `tasks/RECAP-023-CRONJOB-ORG-SETUP.md` for detailed setup guide

### Vercel Function Timeout

Defined in `apps/web/vercel.json`:

```json
{
  "functions": {
    "src/app/api/cron/recap-report/route.{js,ts}": {
      "maxDuration": 300
    }
  }
}
```

**Note**: No `crons` array needed - we use external cron service!

## Usage

### Automatic (Production)

Once deployed to Vercel, the cron job runs automatically every Tuesday at 10am ET.

### Manual Trigger (Testing)

#### Option 1: Local Test Script
```bash
cd apps/web
npm run test:cron-recap
```

This runs the runner directly without HTTP layer.

#### Option 2: HTTP Request (Local)
```bash
# Start dev server
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/cron/recap-report \
  -H "Authorization: Bearer $CRON_SECRET"
```

#### Option 3: HTTP Request (Production)
```bash
curl -X POST https://your-domain.com/api/cron/recap-report \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "week": 5,
  "season": 2025,
  "status": "success",
  "saved": true,
  "filePath": "apps/web/data/reports/recap/2025/week-5.json",
  "backupCreated": true,
  "duration": 65432,
  "triggeredAt": "2025-10-08T14:00:00.000Z"
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": "GEMINI_API_KEY not configured",
  "duration": 123,
  "triggeredAt": "2025-10-08T14:00:00.000Z"
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

## Output Location

Reports are saved to:
```
apps/web/data/reports/recap/{season}/week-{N}.json
```

Example:
```
apps/web/data/reports/recap/
├── 2025/
│   ├── week-5.json
│   ├── week-5.backup.json (previous version)
│   ├── week-6.json
│   └── metadata.json (generation history)
```

## Viewing Reports

After generation, reports are automatically available at:
```
https://your-domain.com/competition/reports/{season}/week-{week}
```

Example: `https://your-domain.com/competition/reports/2025/week-5`

## Monitoring

### Vercel Dashboard

View cron execution logs in Vercel:
1. Go to your project dashboard
2. Click "Functions" tab
3. Find `/api/cron/recap-report`
4. View execution logs and duration

### Success Indicators

- ✅ Status code: 200
- ✅ Response: `"success": true`
- ✅ File created: `week-N.json`
- ✅ Duration: 60-90 seconds (typical)

### Failure Indicators

- ❌ Status code: 500
- ❌ Response: `"success": false`
- ❌ Errors array populated
- ❌ Duration: Very short (< 5 seconds)

## Troubleshooting

### Problem: 401 Unauthorized

**Cause**: Missing or incorrect `CRON_SECRET`

**Solution**:
1. Check Vercel environment variables
2. Ensure `CRON_SECRET` matches the value in your trigger
3. Update Authorization header: `Bearer YOUR_SECRET`

### Problem: Report Generation Fails

**Cause**: Missing `GEMINI_API_KEY` or API error

**Solution**:
1. Verify `GEMINI_API_KEY` is set in Vercel
2. Check Gemini API quota/limits
3. Review error message in response
4. Check function logs in Vercel dashboard

### Problem: Timeout (Function exceeded 5 minutes)

**Cause**: AI generation taking too long

**Solution**:
1. This is rare - typical generation is 60-90 seconds
2. Check Gemini API response times
3. Consider increasing `maxDuration` in vercel.json (max 300s on Pro plan)
4. Report may be partially saved - check file system

### Problem: Report Already Exists

**Cause**: Cron tried to regenerate existing report

**Solution**:
- This is expected behavior (prevents accidental overwrites)
- Manually delete existing report if regeneration needed
- Or modify runner.ts to use `forceRegenerate: true` (not recommended)

### Problem: Wrong Week Detected

**Cause**: `getCurrentWeek()` returning incorrect week

**Solution**:
1. Check Sleeper API status
2. Verify season start date in `@gauntlet/lib/utils.ts`
3. Manually trigger with hardcoded week for testing

## Development

### Testing Changes Locally

```bash
# Run type checking
cd apps/web
npx tsc --noEmit

# Test runner directly
npm run test:cron-recap

# Test with HTTP layer
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/cron/recap-report \
  -H "Authorization: Bearer test-secret"
```

### Adding Notifications

To add Slack/email notifications on success/failure, modify `runner.ts`:

```typescript
// After generation completes
if (result.success) {
  await sendSlackNotification({
    text: `✅ Week ${week} recap generated successfully`,
    url: process.env.SLACK_WEBHOOK_URL,
  });
}
```

### Changing Schedule

Edit `apps/web/vercel.json`:

```json
{
  "crons": [{
    "schedule": "0 12 * * 3"  // Wednesday at noon UTC
  }]
}
```

Cron syntax: `minute hour day month day-of-week`

## Performance

### Typical Execution Times

- **Data Fetching**: 5-10 seconds
- **AI Generation**: 45-70 seconds
- **File System Operations**: < 1 second
- **Total**: 60-90 seconds

### Token Usage

- Typical: 40,000-60,000 tokens per report
- Cost (Gemini 1.5 Flash): $0.01-$0.02 per report
- Monthly cost (18 weeks): ~$0.20-$0.40

### Rate Limits

- Vercel Cron: Hobby plan allows 1 cron job
- Gemini API: 15 RPM, 1M TPM, 1500 RPD (free tier)
- Report generation fits well within free tier limits

## Security

### Authentication

- All requests must include `Authorization: Bearer ${CRON_SECRET}`
- Secret is verified before any processing
- 401 response if auth fails

### Best Practices

1. Use strong random string for `CRON_SECRET` (32+ characters)
2. Store secrets in Vercel environment variables (not in code)
3. Regenerate secret if compromised
4. Monitor execution logs for unauthorized attempts

## Related Documentation

- [RECAP-PHASE-3-DETAILED.md](../../../../../../../../../tasks/RECAP-PHASE-3-DETAILED.md) - Implementation plan
- [integration.ts](../../../../lib/reports/recap/integration.ts) - Report generation API
- [storage/](../../../../lib/reports/recap/storage/) - File system operations
- [generate.ts](../../../../lib/reports/recap/generate.ts) - AI generation logic

## Support

For issues or questions:
1. Check Vercel function logs
2. Run local test script with debug output
3. Review error messages in HTTP response
4. Check environment variable configuration

