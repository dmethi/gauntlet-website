# Sleeper API Documentation

Comprehensive documentation for the Sleeper Fantasy Football API, including
official endpoints and undocumented endpoints discovered through reverse
engineering.

## Overview

This documentation covers:

- **Official API endpoints** from [docs.sleeper.app](https://docs.sleeper.app/)
- **Undocumented endpoints** for stats, projections, and advanced data
- **Multi-season testing** across 2018-2024 seasons
- **Response schemas and TypeScript types**
- **Rate limiting and usage guidelines**

## Quick Start

```javascript
// Basic user lookup
fetch('https://api.sleeper.app/v1/user/username')
  .then(response => response.json())
  .then(user => console.log(user));

// Get player stats for a specific week (undocumented)
fetch('https://api.sleeper.app/v1/stats/nfl/regular/2024/8')
  .then(response => response.json())
  .then(stats => console.log(stats));
```

## Documentation Structure

```
docs/sleeper-api/
├── README.md                    # This file
├── endpoints/                   # Individual endpoint documentation
│   ├── official/               # Documented endpoints
│   │   ├── user.md
│   │   ├── leagues.md
│   │   ├── drafts.md
│   │   └── players.md
│   └── undocumented/           # Reverse-engineered endpoints
│       ├── stats.md            # Player statistics
│       ├── projections.md      # Player projections
│       └── advanced.md         # Other hidden endpoints
├── schemas/                    # Response schemas and types
│   ├── user.json
│   ├── league.json
│   ├── stats.json
│   └── projections.json
├── testing/                    # Test results and examples
│   ├── 2024-season/
│   ├── 2023-season/
│   └── historical/
└── tools/                      # Testing and documentation tools
    ├── endpoint-tester.js
    ├── schema-generator.js
    └── type-generator.js
```

## Rate Limiting

- **General rule**: Stay under 1000 API calls per minute
- **Player stats**: Cache for at least 1 hour during active games
- **Projections**: Cache for 4+ hours, update weekly
- **Static data**: Players list should only be fetched once daily

## Key Findings

### Undocumented Endpoints

Based on analysis of community wrappers, we've identified several undocumented
endpoints:

1. **Player Stats**: `GET /v1/stats/nfl/{season_type}/{season}/{week}`
2. **Player Projections**:
   `GET /v1/projections/nfl/{season_type}/{season}/{week}`
3. **Season Stats**: `GET /v1/stats/nfl/{season_type}/{season}`
4. **Season Projections**: `GET /v1/projections/nfl/{season_type}/{season}`

### Data Quality Issues

- Stats API returns sparse data for individual players
- Team-level aggregates dominate complete datasets
- Projections are more comprehensive than actual stats
- Missing data handling is inconsistent across endpoints

## Usage Examples

### Get Weekly Player Stats (Undocumented)

```javascript
const getWeeklyStats = async (season, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
  );
  return response.json();
};

// Get stats for week 8 of 2024 season
const stats = await getWeeklyStats(2024, 8);
console.log(`Found stats for ${Object.keys(stats).length} players`);
```

### Get Player Projections (Undocumented)

```javascript
const getWeeklyProjections = async (season, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`
  );
  return response.json();
};

// Get projections for week 8 of 2024 season
const projections = await getWeeklyProjections(2024, 8);
console.log(`Found projections for ${Object.keys(projections).length} players`);
```

## Testing Results

We've tested endpoints across multiple seasons to understand:

- Data availability and consistency
- Schema changes over time
- Performance characteristics
- Error handling

See the `testing/` directory for detailed results.

## Contributing

When documenting new endpoints:

1. **Test thoroughly** across multiple seasons
2. **Document edge cases** and error conditions
3. **Include response examples** with real data
4. **Generate TypeScript types** for responses
5. **Note rate limiting** and caching recommendations

## Related Resources

- [Official Sleeper API Docs](https://docs.sleeper.app/)
- [Community Python Wrapper](https://github.com/dtsong/sleeper-api-wrapper)
- [Community Node.js Wrapper](https://github.com/BankkRoll/sleeper-wrapper)
- [Community Go Wrapper](https://github.com/battle-of-the-states/sleeper-go-wrapper)
