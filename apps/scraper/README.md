# The Gauntlet Data Scraper

Automated data scraping and ingestion service for fantasy football statistics,
player information, and game schedules.

## Features

- **Player Data**: Names, positions, team assignments, injury status
- **Game Statistics**: Real-time scoring, advanced metrics, snap counts
- **Schedule Information**: Game times, bye weeks, playoff brackets
- **Injury Reports**: Daily injury updates and probability assessments
- **Weather Data**: Game-day weather conditions for outdoor stadiums

## Data Sources

- ESPN Fantasy API
- Yahoo Fantasy API
- NFL.com Statistics
- FantasyPros Projections
- Pro Football Reference
- Weather Underground API

## Development

```bash
# Install dependencies
pnpm install

# Run scraper service
pnpm dev

# Build for production
pnpm build

# Run specific scrapers
pnpm scrape:players
pnpm scrape:stats
pnpm scrape:schedule
```

## Scheduling

The scraper runs on automated schedules:

- **Player Updates**: Daily at 3:00 AM EST
- **Live Stats**: Every hour during game days (Sunday, Monday, Thursday)
- **Schedule Updates**: Weekly on Tuesday at 2:00 AM EST

## Configuration

Environment variables required:

```bash
NODE_ENV=development
ESPN_API_KEY=your_espn_key
YAHOO_CLIENT_ID=your_yahoo_id
YAHOO_CLIENT_SECRET=your_yahoo_secret
WEATHER_API_KEY=your_weather_key
DATABASE_URL=your_database_url
```

## Data Pipeline

1. **Extraction**: Fetch data from multiple sources
2. **Transformation**: Normalize formats and calculate fantasy points
3. **Validation**: Verify data integrity and handle duplicates
4. **Loading**: Store in database with proper indexing
5. **Notification**: Alert simulation engine of updates
