# Player Statistics (Undocumented)

The Sleeper API includes undocumented endpoints for accessing player statistics that are not mentioned in the official documentation. These endpoints provide access to weekly and seasonal stats data.

## Endpoints

### Get Weekly Stats
```
GET /v1/stats/nfl/{season_type}/{season}/{week}
```

**Parameters:**
- `season_type`: `"regular"`, `"pre"`, or `"post"`
- `season`: Year (e.g., `2024`, `2023`)
- `week`: Week number (1-18 for regular season)

**Example:**
```javascript
// Get stats for week 8 of 2024 regular season
fetch('https://api.sleeper.app/v1/stats/nfl/regular/2024/8')
```

### Get Season Stats
```
GET /v1/stats/nfl/{season_type}/{season}
```

**Parameters:**
- `season_type`: `"regular"`, `"pre"`, or `"post"`
- `season`: Year (e.g., `2024`, `2023`)

**Example:**
```javascript
// Get all regular season stats for 2024
fetch('https://api.sleeper.app/v1/stats/nfl/regular/2024')
```

## Response Format

The API returns a JSON object where keys are player IDs (or team IDs like `"TEAM_BUF"`) and values are stat objects.

```json
{
  "player_id": {
    "stat_name": value,
    "stat_name_2": value,
    ...
  },
  "another_player_id": {
    ...
  }
}
```

## Data Quality Analysis

Based on testing Week 8, 2024 data:

- **Total entries**: ~2,400 players/teams
- **Team entries**: 32 (e.g., `TEAM_BUF`, `TEAM_HOU`)
- **Individual players**: ~2,368
- **Players with substantial data**: ~384 (20+ stat categories)
- **Players with fantasy stats**: ~487

### Most Complete Data
Team-level aggregates have the most complete statistics (80+ categories), while individual players vary significantly in data completeness.

### Top Individual Players (by stat completeness)
1. **Player 5892**: 52 stats (likely RB with receiving work)
2. **Player 4018**: 48 stats (likely RB)
3. **Player 7523**: 47 stats (likely QB)

## Available Stat Categories

### Core Fantasy Stats
- `pts_ppr`: PPR fantasy points
- `pts_half_ppr`: Half-PPR fantasy points  
- `pts_std`: Standard fantasy points
- `rec`: Receptions
- `rec_yd`: Receiving yards
- `rec_td`: Receiving touchdowns
- `rush_att`: Rush attempts
- `rush_yd`: Rushing yards
- `rush_td`: Rushing touchdowns
- `pass_att`: Pass attempts
- `pass_yd`: Passing yards
- `pass_td`: Passing touchdowns
- `pass_cmp`: Pass completions
- `pass_int`: Interceptions thrown
- `fum_lost`: Fumbles lost

### Advanced Stats (219 total categories)
- `pos_rank_ppr`: Position rank in PPR
- `pos_rank_half_ppr`: Position rank in half-PPR
- `pos_rank_std`: Position rank in standard
- `gms_active`: Games active
- `tm_off_snp`: Team offensive snaps
- `tm_def_snp`: Team defensive snaps  
- `tm_st_snp`: Team special teams snaps
- `rec_tgt`: Targets
- `rec_air_yd`: Air yards
- `rec_yac`: Yards after catch
- `pass_air_yd`: Passing air yards
- `pass_ypa`: Yards per attempt
- `rush_ypa`: Yards per carry
- `idp_tkl`: IDP tackles
- `idp_sack`: IDP sacks
- And 200+ more...

## Usage Examples

### Get Player Fantasy Points
```javascript
const getPlayerPoints = async (playerId, season, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
  );
  const stats = await response.json();
  
  if (stats[playerId]) {
    return {
      ppr: stats[playerId].pts_ppr || 0,
      halfPpr: stats[playerId].pts_half_ppr || 0,
      standard: stats[playerId].pts_std || 0
    };
  }
  return null;
};
```

### Find Top Performers
```javascript
const getTopPerformers = async (season, week, statCategory = 'pts_ppr') => {
  const response = await fetch(
    `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
  );
  const stats = await response.json();
  
  const players = Object.entries(stats)
    .filter(([playerId, data]) => !playerId.startsWith('TEAM_'))
    .filter(([playerId, data]) => data[statCategory])
    .map(([playerId, data]) => ({
      playerId,
      value: data[statCategory]
    }))
    .sort((a, b) => b.value - a.value);
    
  return players.slice(0, 10); // Top 10
};
```

### Aggregate Season Stats
```javascript
const getSeasonStats = async (playerId, season) => {
  const seasonStats = {};
  
  // Get stats for weeks 1-18
  for (let week = 1; week <= 18; week++) {
    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
      );
      const weekData = await response.json();
      
      if (weekData[playerId]) {
        Object.entries(weekData[playerId]).forEach(([stat, value]) => {
          if (typeof value === 'number') {
            seasonStats[stat] = (seasonStats[stat] || 0) + value;
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to get week ${week} data:`, error);
    }
    
    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return seasonStats;
};
```

## Rate Limiting & Caching

- **Recommendation**: Cache stats for at least 1 hour during active games
- **Bulk requests**: Add delays between calls (100ms minimum)
- **Season aggregation**: Consider caching season totals to avoid repeated calls

## Data Gotchas

1. **Sparse Data**: Many players have limited stats (position ranks only)
2. **Team vs Player**: Team entries (`TEAM_*`) have the most complete data
3. **Missing Weeks**: Not all weeks may have data for all players
4. **Null Values**: Missing stats are omitted rather than set to 0
5. **ID Format**: Player IDs are strings, not integers

## Testing Results

### 2024 Season (Week 8)
- **API Response Time**: ~200-500ms
- **Data Size**: ~2MB uncompressed
- **Success Rate**: 100% for weeks 1-8
- **Unique Stats**: 219 different stat categories found
- **Fantasy Relevant**: ~50 core stats for fantasy football

### Historical Testing
- **2023 Season**: Similar structure and availability
- **2022 Season**: Consistent schema
- **Pre-2022**: Limited testing, assume similar format

## Related Endpoints
- [Player Projections](./projections.md) - Weekly/seasonal projections
- [Players List](../official/players.md) - Player metadata and IDs 