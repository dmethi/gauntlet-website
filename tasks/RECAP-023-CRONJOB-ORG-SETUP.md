# Setting Up Automated Reports with cron-job.org

**Complete guide for configuring weekly recap generation using cron-job.org**

---

## Overview

Instead of using Vercel's built-in cron jobs, we use **cron-job.org** - a free,
reliable external cron service that triggers our API endpoint every Tuesday at
10am ET.

### Why cron-job.org?

- ✅ Free tier includes 1-minute execution intervals
- ✅ More reliable than Vercel Hobby plan cron (1 job limit)
- ✅ Better monitoring and logs
- ✅ Email notifications on failures
- ✅ Easy to pause/resume
- ✅ No vendor lock-in

---

## 🚀 Quick Setup (5 minutes)

### 1. Deploy Your API Endpoint

First, ensure your code is deployed to Vercel:

```bash
git add .
git commit -m "feat: Add automated weekly recap cron job endpoint"
git push origin main
```

Your API endpoint will be available at:

```
https://your-domain.vercel.app/api/cron/recap-report
```

### 2. Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
GEMINI_API_KEY=AIzaSyAHXPv-sohyQXWg6TSwQR9x2Rlwja-mA74
CRON_SECRET=your-random-32-character-secret-here
```

Generate a strong secret:

```bash
openssl rand -hex 32
```

**Important**: Save your `CRON_SECRET` - you'll need it for step 3!

### 3. Create cron-job.org Account

1. Go to https://cron-job.org
2. Click "Sign up for free"
3. Create account (email verification required)
4. Log in to dashboard

### 4. Create the Cron Job

In your cron-job.org dashboard:

#### Basic Settings:

- **Title**: `Weekly Recap Report Generation`
- **Address (URL)**: `https://your-domain.vercel.app/api/cron/recap-report`
- **Request method**: `POST`
- **Request timeout**: `300` seconds (5 minutes)

#### Schedule:

- **Pattern**: Custom
- **Cron expression**: `0 14 * * 2`
- **Timezone**: `UTC`
- **Description**: "Every Tuesday at 2pm UTC (10am ET)"

**Or use the visual editor:**

- **Every**: Tuesday
- **At**: 14:00 (2pm)
- **Timezone**: UTC

#### Request Headers:

Click "Add header":

- **Name**: `Authorization`
- **Value**: `Bearer YOUR_CRON_SECRET_HERE`

(Replace `YOUR_CRON_SECRET_HERE` with the secret from step 2)

#### Notifications (Optional but Recommended):

- ✅ **Email on failure**: Enable
- ✅ **Email after**: 1 consecutive failures
- ⬜ **Email on success**: Disable (to avoid spam)

#### Advanced Settings:

- **Save responses**: Enable (last 10)
- **Retry on failure**: Disable (we handle retries internally)
- **Follow redirects**: Enable

### 5. Test the Job

Before waiting for Tuesday:

1. In cron-job.org dashboard, find your job
2. Click **"Run now"** button (play icon)
3. Wait 60-90 seconds for generation
4. Check execution log:
   - ✅ Status: 200 (success)
   - ✅ Response body shows `"success": true`
   - ✅ Duration: ~60-90 seconds

### 6. Verify Report Created

After successful test:

1. Check your website: `https://your-domain.com/competition/reports/2025/week-6`
2. Verify report appears on homepage
3. Check file exists: `apps/web/data/reports/recap/2025/week-6.json`

---

## 📊 Expected Behavior

### When Cron Runs (Every Tuesday 10am ET):

```
Tuesday 10:00 AM ET (2:00 PM UTC)
    ↓
cron-job.org triggers POST request
    ↓
Authorization header validated (CRON_SECRET)
    ↓
Current NFL week detected (e.g., Week 6)
    ↓
Gemini AI generates report sections (60-90s)
    ↓
Report saved to file system
    ↓
200 response returned to cron-job.org
    ↓
Report automatically visible on website
```

### Success Response (200):

```json
{
  "success": true,
  "week": 6,
  "season": 2025,
  "status": "success",
  "saved": true,
  "filePath": "apps/web/data/reports/recap/2025/week-6.json",
  "duration": 65432,
  "triggeredAt": "2025-10-09T14:00:00.000Z"
}
```

### Error Response (500):

```json
{
  "success": false,
  "error": "GEMINI_API_KEY not configured",
  "duration": 123,
  "triggeredAt": "2025-10-09T14:00:00.000Z"
}
```

---

## 🔍 Monitoring

### cron-job.org Dashboard

**Execution History:**

- View last 100 executions
- See response codes and durations
- Download response bodies
- Filter by success/failure

**Email Alerts:**

- Automatic notification on failures
- Includes error message and status code
- Link to execution details

### Vercel Function Logs

Go to: Vercel Dashboard → Functions → `/api/cron/recap-report`

**Look for:**

- ✅ `[CRON] Starting weekly recap generation...`
- ✅ `[CRON] Weekly recap generation completed`
- ✅ Duration: ~60-90 seconds
- ✅ No error logs

### Website Verification

After each Tuesday run:

1. Visit `/competition/reports` - latest report listed first
2. Click into report - all sections present
3. Check homepage - "Latest Report" badge
4. Verify data accuracy (scores, records, names)

---

## 🛠 Troubleshooting

### Problem: 401 Unauthorized

**Symptoms:**

- cron-job.org shows status 401
- Response: `{"error":"Unauthorized"}`

**Solutions:**

1. Verify `Authorization` header is set in cron-job.org:
   - Name: `Authorization`
   - Value: `Bearer YOUR_SECRET` (include "Bearer " prefix!)
2. Check `CRON_SECRET` in Vercel matches exactly
3. Ensure no extra spaces in header value
4. Re-generate secret if compromised

### Problem: 500 - GEMINI_API_KEY not configured

**Symptoms:**

- Status 500
- Error: "GEMINI_API_KEY not configured"
- Duration < 5 seconds

**Solutions:**

1. Add `GEMINI_API_KEY` to Vercel environment variables
2. Redeploy to apply env changes
3. Verify API key is valid on Google AI Studio
4. Check API quota hasn't been exceeded

### Problem: 500 - Report already exists

**Symptoms:**

- Status 500
- Error: "Report already exists for Week N"
- Generation skipped

**This is expected behavior** (prevents accidental overwrites)

**Solutions:**

- Delete existing report file if regeneration needed
- Or wait for next week
- Or manually trigger with different week number

### Problem: Timeout (No response after 5 minutes)

**Symptoms:**

- cron-job.org shows timeout error
- Execution marked as failed
- No response received

**Solutions:**

1. Check Vercel function logs for errors
2. Verify `maxDuration: 300` is set in vercel.json
3. Check Gemini API response times
4. Very rare - typical generation is 60-90 seconds
5. Consider upgrading Vercel plan if persistent

### Problem: Wrong Week Generated

**Symptoms:**

- Report generated for incorrect week
- Week number doesn't match current NFL week

**Solutions:**

1. Check Sleeper API: https://api.sleeper.app/v1/state/nfl
2. Verify season start date in `@gauntlet/lib/utils.ts` is correct
3. Check `getCurrentWeek()` function logic
4. Manually test week detection with test script

### Problem: Report Not Visible on Website

**Symptoms:**

- File created successfully
- cron-job.org shows 200 status
- But report doesn't appear on website

**Solutions:**

1. Check JSON file structure is valid
2. Verify file location: `data/reports/recap/2025/week-N.json`
3. Test report loader: `npm run test:dynamic-reports`
4. Clear Next.js cache: Delete `.next` folder and rebuild
5. Check dynamic route at `/competition/reports/[season]/week-[week]`
6. Verify `report-loader.ts` has no errors

---

## 🔐 Security Best Practices

### CRON_SECRET Management:

- ✅ Use 32+ character random string
- ✅ Generate with: `openssl rand -hex 32`
- ✅ Store only in Vercel environment variables
- ✅ Never commit to git or share publicly
- ✅ Rotate quarterly (update both Vercel and cron-job.org)
- ✅ Use different secret for staging/production

### cron-job.org Account:

- ✅ Enable two-factor authentication
- ✅ Use strong password
- ✅ Don't share account credentials
- ✅ Review execution history regularly
- ✅ Set up email notifications for suspicious activity

### Monitoring:

- ✅ Check execution logs weekly
- ✅ Verify response codes are 200
- ✅ Monitor execution duration (should be consistent)
- ✅ Alert on multiple consecutive failures
- ✅ Review Vercel function logs for unauthorized attempts

---

## 📈 Cost & Performance

### cron-job.org Free Tier:

- ✅ **Cost**: $0/month
- ✅ **Jobs**: Up to 3 jobs
- ✅ **Interval**: Down to 1 minute
- ✅ **Execution history**: Last 100 runs
- ✅ **Email notifications**: Unlimited
- ✅ **Perfect for our use case!**

### Vercel Hosting:

- **Free Tier**: Includes hobby plan
- **Function invocations**: 100GB-hours/month (plenty)
- **Function duration**: Up to 10 seconds (we need 300s)
- **⚠️ Upgrade to Pro**: Required for 5-minute functions ($20/month)
- **Or**: Split generation into smaller chunks (future optimization)

### Gemini API (Free Tier):

- **Tokens per report**: 40,000-60,000
- **Cost per report**: $0.01-$0.02 (Flash model)
- **Weekly**: $0.01-$0.02
- **Season (18 weeks)**: ~$0.20-$0.40
- **Rate limits**: 15 RPM, 1M TPM, 1500 RPD
- **Our usage**: Well within free tier limits

**Total Monthly Cost**: $0 (if on Vercel free tier) or $20 (Vercel Pro)

---

## 🧪 Testing

### Before First Tuesday:

#### 1. Test API Endpoint Locally

```bash
cd apps/web
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/cron/recap-report \
  -H "Authorization: Bearer test-secret"
```

#### 2. Test Runner Logic

```bash
npm run test:cron-recap
```

#### 3. Test Full Generation

```bash
npm run test:recap-orchestration -- --week 6 -o report.md
```

#### 4. Test on cron-job.org

- Use "Run now" button
- Verify 200 response
- Check report created

### Manual Trigger (Production)

To test or regenerate a report manually:

```bash
curl -X POST https://your-domain.vercel.app/api/cron/recap-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use cron-job.org's "Run now" button.

---

## 📝 Configuration Reference

### Cron Expression: `0 14 * * 2`

```
┌─── minute (0)
│ ┌─── hour (14 = 2pm UTC)
│ │ ┌─── day of month (*)
│ │ │ ┌─── month (*)
│ │ │ │ ┌─── day of week (2 = Tuesday)
│ │ │ │ │
0 14 * * 2
```

**Translation**: At 2:00 PM UTC, every Tuesday

**Eastern Time**: 10:00 AM ET (during DST) / 9:00 AM ET (standard)

### Time Zone Conversion:

- **UTC**: 14:00 (2pm)
- **ET (DST)**: 10:00 (10am) ← Most of NFL season
- **ET (Standard)**: 09:00 (9am)
- **PT (DST)**: 07:00 (7am)
- **PT (Standard)**: 06:00 (6am)

**Note**: cron-job.org uses UTC, so the job always runs at 2pm UTC regardless of
daylight saving time. This means it runs at 10am ET during most of the NFL
season.

---

## 🎯 First Tuesday Checklist

Before first automated run:

- [ ] Code deployed to Vercel
- [ ] `GEMINI_API_KEY` set in Vercel
- [ ] `CRON_SECRET` set in Vercel
- [ ] cron-job.org account created
- [ ] Cron job configured with correct URL
- [ ] Authorization header added
- [ ] Schedule set to `0 14 * * 2`
- [ ] Email notifications enabled
- [ ] "Run now" test successful (200 response)
- [ ] Test report visible on website
- [ ] Monitoring dashboard bookmarked

**During first automated run:**

1. Watch cron-job.org execution log at 2pm UTC
2. Verify 200 status code
3. Check report appears on website within 2 minutes
4. Validate data accuracy
5. Review Vercel function logs

**After successful run:**

- ✅ Update documentation with any learnings
- ✅ Set up weekly monitoring reminder
- ✅ Celebrate! 🎉

---

## 📚 Additional Resources

### Documentation:

- [cron-job.org Documentation](https://cron-job.org/en/documentation/)
- [Cron Expression Guide](https://crontab.guru/)
- [RECAP-023-COMPLETE.md](./RECAP-023-COMPLETE.md) - Implementation details
- [API README](../apps/web/src/app/api/cron/recap-report/README.md) - Technical
  docs

### Useful Links:

- [cron-job.org Dashboard](https://console.cron-job.org/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Sleeper NFL State API](https://api.sleeper.app/v1/state/nfl)
- [Google AI Studio](https://aistudio.google.com/) - Manage Gemini API keys

### Support:

- cron-job.org: support@cron-job.org
- Vercel: https://vercel.com/support
- Project issues: [Your GitHub repo issues]

---

## ✅ Success!

Once configured, your system will:

- ✅ Automatically generate reports every Tuesday at 10am ET
- ✅ Detect current NFL week automatically
- ✅ Generate comprehensive AI-powered narratives
- ✅ Save reports with automatic backups
- ✅ Display reports on website instantly
- ✅ Send email alerts on failures
- ✅ Maintain execution history
- ✅ Cost: $0/month (free tier)

**You now have fully automated, reliable weekly recap generation! 🚀**

---

**Created**: October 9, 2025  
**Status**: Production Ready  
**Service**: cron-job.org (free tier)  
**Next**: Set up your cron job and wait for Tuesday!
