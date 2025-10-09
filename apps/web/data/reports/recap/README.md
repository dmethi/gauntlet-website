# Weekly Recap Reports Storage

This directory stores generated weekly recap reports in JSON format.

## Directory Structure

```
recap/
├── 2025/
│   ├── week-1.json
│   ├── week-1.backup.json (previous version, if regenerated)
│   ├── week-2.json
│   ├── week-3.json
│   ├── week-4.json
│   ├── week-5.json
│   └── metadata.json (generation history)
├── 2024/
│   └── ...
└── README.md (this file)
```

## Report Format

Each report file follows the `WeeklyRecapReport` type structure:

```typescript
{
  metadata: {
    week: number;
    season: number;
    generatedAt: string; // ISO timestamp
    generationTime: number; // milliseconds
    tokensUsed: number;
    version: string; // "1.0.0"
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
  },
  sections: {
    leagueOverview: { narrative: string; stats: {...}; generatedAt: string },
    matchupNarratives: [...],
    hallOfFame: { narrative: string; highlights: {...}; generatedAt: string },
    hallOfShame: { narrative: string; lowlights: {...}; generatedAt: string },
    powerRankings: { narrative: string; rankings: [...]; generatedAt: string },
    standings: { narrative: string; standings: {...}; playoffPicture: {...}; generatedAt: string },
    upcoming: { narrative: string; matchups: [...]; generatedAt: string },
    closing: { narrative: string; generatedAt: string }
  }
}
```

## Accessing Reports

### Via Dynamic Route

Reports are automatically accessible via the dynamic route:
- URL pattern: `/competition/reports/{season}/week-{week}`
- Example: `/competition/reports/2025/week-5`

### Via API/Loader

```typescript
import { loadRecapReport } from '@/lib/reports/recap/utils/report-loader';

const report = await loadRecapReport('2025', '5');
```

## Generating Reports

### Manual Generation

```bash
npm run generate-recap -- --week 5
```

### Automated Generation

Reports are generated automatically via Vercel Cron every Tuesday at 10am ET.

## Backups

When a report is regenerated, the previous version is automatically backed up:
- Original: `week-5.json`
- Backup: `week-5.backup.json`

## Metadata Tracking

The `metadata.json` file tracks generation history:

```json
{
  "2025": {
    "week-5": {
      "generated": ["2025-10-08T10:00:00Z", "2025-10-07T12:00:00Z"],
      "lastStatus": "success",
      "lastDuration": 85432,
      "lastTokens": 45231
    }
  }
}
```

## Testing

To test report generation and viewing:

1. **Generate a test report:**
   ```bash
   npm run generate-recap -- --week 5 --dry-run
   ```

2. **View in browser:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/competition/reports/2025/week-5
   ```

3. **Check file exists:**
   ```bash
   ls -la data/reports/recap/2025/
   cat data/reports/recap/2025/week-5.json | jq '.metadata'
   ```

## Troubleshooting

### Report not appearing

1. Check file exists: `ls data/reports/recap/{season}/week-{N}.json`
2. Validate JSON: `cat file.json | jq`
3. Check Next.js build: `npm run build`
4. Clear cache: `rm -rf .next && npm run dev`

### Generation fails

1. Check Gemini API key: `echo $GEMINI_API_KEY`
2. Check logs: See console output during generation
3. Try dry-run mode: `--dry-run` flag
4. Check error metadata in partial reports

## File Size

Typical report sizes:
- Small (success): ~50-100KB
- Medium (with all data): ~150-250KB  
- Large (detailed narratives): ~300-500KB

## Retention

- Active season reports: Keep all
- Previous seasons: Archive after championship
- Backups: Keep 1 previous version only
