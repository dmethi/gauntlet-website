# Player Projections (Undocumented)

The Sleeper API includes undocumented endpoints for accessing player projections that complement the stats endpoints. These provide projected performance data for upcoming games and seasons.

## Endpoints

### Get Weekly Projections
```
GET /v1/projections/nfl/{season_type}/{season}/{week}
```

**Parameters:**
- `season_type`: `"regular"`, `"pre"`, or `"post"`
- `season`: Year (e.g., `2024`, `2023`)
- `week`: Week number (1-18 for regular season)

**Example:**
```javascript
// Get projections for week 8 of 2024 regular season
fetch('https://api.sleeper.app/v1/projections/nfl/regular/2024/8')
```

### Get Season Projections
```
GET /v1/projections/nfl/{season_type}/{season}
```

**Parameters:**
- `season_type`: `"regular"`, `"pre"`, or `"post"`
- `season`: Year (e.g., `2024`, `2023`)

**Example:**
```javascript
// Get all regular season projections for 2024
fetch('https://api.sleeper.app/v1/projections/nfl/regular/2024')
```

## Response Format

Similar to stats, returns a JSON object with player IDs as keys and projection objects as values.

```json
{
  "player_id": {
    "pts_ppr": 16.2,
    "pts_half_ppr": 14.8,
    "pts_std": 13.4,
    "rec": 4.2,
    "rec_yd": 62.5,
    "rec_td": 0.4,
    "rush_att": 12.8,
    "rush_yd": 87.3,
    "rush_td": 0.6,
    ...
  }
}
```

## Data Quality Analysis

Based on testing Week 8, 2024 data:

- **Total entries**: ~8,599 players (much higher than stats)
- **Players with substantial data**: ~939 (10+ projection categories)
- **Most complete projections**: 30+ categories per top player
- **Coverage**: Much broader than actual stats data

### Why Projections Are More Complete
- Projections can be generated for all rostered players
- Don't require actual game performance
- Include bench players and handcuffs
- Cover multiple stat categories proactively

### Top Players (by projection completeness)
1. **Player 4381**: 31 projections (likely starting RB)
2. **Player 8150**: 30 projections (likely starting RB) 
3. **Player 5947**: 29 projections (likely starting WR/TE)

## Available Projection Categories

### Core Fantasy Projections
- `pts_ppr`: Projected PPR fantasy points
- `pts_half_ppr`: Projected half-PPR fantasy points
- `pts_std`: Projected standard fantasy points
- `rec`: Projected receptions
- `rec_yd`: Projected receiving yards
- `rec_td`: Projected receiving touchdowns
- `rush_att`: Projected rushing attempts
- `rush_yd`: Projected rushing yards
- `rush_td`: Projected rushing touchdowns
- `pass_att`: Projected passing attempts
- `pass_yd`: Projected passing yards
- `pass_td`: Projected passing touchdowns
- `pass_cmp`: Projected completions
- `pass_int`: Projected interceptions
- `fum_lost`: Projected fumbles lost

### Advanced Projections (96 total categories)
- `adp_dd_ppr`: Average Draft Position (PPR)
- `pos_adp_dd_ppr`: Position-based ADP
- `gp`: Projected games played
- `rec_tgt`: Projected targets
- `rec_fd`: Projected first downs (receiving)
- `rush_fd`: Projected first downs (rushing)
- `pass_fd`: Projected first downs (passing)
- `fga`: Projected field goal attempts (K)
- `fgm`: Projected field goals made (K)
- `xpa`: Projected extra point attempts (K)
- `xpm`: Projected extra points made (K)
- `idp_tkl`: Projected tackles (IDP)
- `idp_sack`: Projected sacks (IDP)
- And 80+ more...

## Usage Examples

### Get Player Projections
```javascript
const getPlayerProjections = async (playerId, season, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`
  );
  const projections = await response.json();
  
  if (projections[playerId]) {
    return {
      ppr: projections[playerId].pts_ppr || 0,
      halfPpr: projections[playerId].pts_half_ppr || 0,
      standard: projections[playerId].pts_std || 0,
      ceiling: projections[playerId].pts_ppr * 1.5, // Simple ceiling calc
      floor: projections[playerId].pts_ppr * 0.5    // Simple floor calc
    };
  }
  return null;
};
```

### Find Value Picks
```javascript
const getValuePicks = async (season, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`
  );
  const projections = await response.json();
  
  // Find players with high projections but low ADP
  const valuePlayers = Object.entries(projections)
    .filter(([playerId, data]) => data.pts_ppr && data.adp_dd_ppr)
    .map(([playerId, data]) => ({
      playerId,
      projection: data.pts_ppr,
      adp: data.adp_dd_ppr,
      value: data.pts_ppr / (200 - data.adp_dd_ppr) // Simple value calc
    }))
    .sort((a, b) => b.value - a.value);
    
  return valuePlayers.slice(0, 20);
};
```

### Compare Projections vs Actual
```javascript
const compareProjectionsToActual = async (playerId, season, week) => {
  // Get projections
  const projResponse = await fetch(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`
  );
  const projections = await projResponse.json();
  
  // Get actual stats
  const statsResponse = await fetch(
    `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
  );
  const stats = await statsResponse.json();
  
  if (projections[playerId] && stats[playerId]) {
    return {
      projected: {
        ppr: projections[playerId].pts_ppr || 0,
        rec: projections[playerId].rec || 0,
        recYd: projections[playerId].rec_yd || 0,
        rushYd: projections[playerId].rush_yd || 0
      },
      actual: {
        ppr: stats[playerId].pts_ppr || 0,
        rec: stats[playerId].rec || 0,
        recYd: stats[playerId].rec_yd || 0,
        rushYd: stats[playerId].rush_yd || 0
      }
    };
  }
  
  return null;
};
```

### Season-Long Projections
```javascript
const getSeasonProjections = async (playerId, season) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}`
  );
  const projections = await response.json();
  
  if (projections[playerId]) {
    const player = projections[playerId];
    
    // Estimate 17-week totals
    const weeklyProj = player.pts_ppr || 0;
    const gamesPlayed = player.gp || 17;
    
    return {
      weeklyAverage: weeklyProj,
      seasonTotal: weeklyProj * gamesPlayed,
      perGameBreakdown: {
        rec: player.rec || 0,
        recYd: player.rec_yd || 0,
        recTd: player.rec_td || 0,
        rushAtt: player.rush_att || 0,
        rushYd: player.rush_yd || 0,
        rushTd: player.rush_td || 0
      }
    };
  }
  
  return null;
};
```

## Rate Limiting & Caching

- **Recommendation**: Cache projections for 4+ hours
- **Weekly updates**: Projections typically update once or twice per week
- **Season projections**: Cache for 24+ hours, updated less frequently
- **Bulk analysis**: Add delays when processing many players

## Data Insights

### Projection Accuracy
- Projections tend to be conservative for boom/bust players
- More accurate for consistent, high-volume players
- Weather and injury impacts not always reflected quickly

### Usage Patterns
- RBs typically have more complete projection sets
- QBs have comprehensive passing projections
- Defense/ST projections are less reliable
- Kicker projections are basic but consistent

### ADP Integration
Many players have ADP (Average Draft Position) data included:
- `adp_dd_ppr`: Overall ADP in PPR formats
- `pos_adp_dd_ppr`: Position-relative ADP
- Useful for draft preparation and trade analysis

## Testing Results

### 2024 Season (Week 8)
- **API Response Time**: ~150-300ms
- **Data Size**: ~3MB uncompressed  
- **Players with projections**: 8,599
- **Unique categories**: 96 different projection types
- **High-quality projections**: ~939 players with 10+ categories

### Comparison to Stats
- **3.6x more players** than stats endpoint
- **Better coverage** of bench/depth players
- **More forward-looking** data vs historical stats
- **Include draft context** with ADP data

## Integration Tips

### Fantasy Applications
1. **Lineup optimization**: Use projections for weekly decisions
2. **Trade analysis**: Compare projected vs actual values
3. **Waiver pickups**: Find projected breakouts
4. **Season planning**: Use ADP data for draft prep

### Data Pipeline
1. **Cache aggressively**: Projections change infrequently
2. **Combine with stats**: Use both for complete picture
3. **Handle missing data**: Not all players have projections
4. **Update schedule**: Check for new projections 2x weekly

## Data Gotchas

1. **Projection vs Reality**: Projections are estimates, not guarantees
2. **Missing Players**: Some players lack projection data
3. **ADP Relevance**: ADP data may be from start of season
4. **Decimal Precision**: Projections use decimal values extensively
5. **Position Context**: Same player may have different projections per position

## Related Endpoints
- [Player Statistics](./stats.md) - Actual performance data
- [Players List](../official/players.md) - Player metadata and IDs
- [NFL State](../official/state.md) - Current week and season info 