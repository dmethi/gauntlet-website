# Username Mapping Reference

This directory contains the username-to-real-name mapping for all Gauntlet Fantasy Football league participants.

## Files

### `username-mapping.json`

Auto-generated reference file containing mappings for all users in both AFC and NFC leagues.

**Fields:**

- `userId`: Unique Sleeper user ID
- `username`: Sleeper username (may be empty)
- `displayName`: Sleeper display name (used for lookups)
- `realName`: Real-world name for use in reports
- `teamName`: Fantasy team name
- `leagueId`: AFC or NFC league ID
- `rosterId`: Roster ID within the league (1-12)
- `record`: Current season record (e.g., "3-2")

**Example:**

```json
{
  "userId": "465307317622009856",
  "displayName": "dmethi",
  "realName": "Dhruv",
  "teamName": "Mach 10",
  "leagueId": "1263740549504962561",
  "rosterId": 2,
  "record": "3-2"
}
```

## Usage

### Import the utility module

```typescript
import {
  getRealNameByDisplayName,
  getRealNameByTeamName,
  getRealNameByRoster,
  getUserMapping,
  getUsersByLeague,
} from '@/lib/username-mapping';
```

### Lookup by display name

```typescript
const realName = getRealNameByDisplayName('dmethi');
// Returns: "Dhruv"
```

### Lookup by team name

```typescript
const realName = getRealNameByTeamName('Marginal Returns');
// Returns: "Jeffrey"
```

### Lookup by roster and league

```typescript
import { LEAGUE_IDS } from '@/lib/constants';

const realName = getRealNameByRoster(LEAGUE_IDS.NFC, 9);
// Returns: "Jeffrey"
```

### Get full user mapping

```typescript
const user = getUserMapping({ displayName: 'dmethi' });
// Returns: {
//   userId: "465307317622009856",
//   displayName: "dmethi",
//   realName: "Dhruv",
//   teamName: "Mach 10",
//   leagueId: "1263740549504962561",
//   rosterId: 2,
//   record: "3-2"
// }
```

## Regenerating the Mapping

If names need to be updated or the mapping is out of date:

1. Update `KNOWN_NAME_MAPPINGS` in `scripts/generate-username-mapping.ts`
2. Run: `npm run generate:usernames`
3. Review the output in `data/username-mapping.json`
4. Commit the updated file

## Testing

Run the test suite to verify the mapping works correctly:

```bash
npm run test:username-mapping
```

This will test all lookup methods and display the current mappings for both leagues.

## Notes

- The mapping is automatically updated with current records when regenerated
- Display names are preferred over usernames (which are often empty)
- Team names may be "Unknown Team" if not set in Sleeper
- The `realName` field is manually curated based on league context
