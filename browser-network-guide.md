# 🔍 **Finding Sleeper's Real Projection API**

## **Browser Network Investigation Guide**

### **Step 1: Open Sleeper Web App**
```bash
# Open this exact URL in Chrome/Firefox:
https://sleeper.com/leagues/1263744209295245312/matchup/5
```

### **Step 2: Network Analysis**
1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Clear existing requests**  
4. **Refresh the page** or navigate to a matchup
5. **Look for these patterns:**

#### **A. Projection-Related API Calls:**
```
🎯 LOOK FOR:
- projections
- scoring  
- matchup/[id]/details
- player/[id]/projection
- league/[id]/scoring_settings
- stats with league context
```

#### **B. Key Headers to Note:**
```
Authorization: Bearer [token]
Cookie: session_id=[id]
X-League-ID: 1263744209295245312
User-Agent: [browser string]
Referer: https://sleeper.com
```

### **Step 3: Common Endpoints to Test**

Based on reverse engineering patterns, try these:

```javascript
// 1. League scoring rules (affects projections)
https://api.sleeper.app/v1/league/1263744209295245312/settings

// 2. Matchup with projection data
https://sleeper.com/api/league/1263744209295245312/matchup/5/projections

// 3. Player projections with league context  
https://sleeper.com/api/players/projections?league_id=1263744209295245312&week=5

// 4. Internal scoring-adjusted endpoint
https://api.sleeper.app/internal/league/1263744209295245312/projections/5

// 5. GraphQL with proper query
POST https://sleeper.com/graphql
{
  "query": "{ league(id: \"1263744209295245312\") { projections(week: 5) { playerId points } } }"
}
```

---

## **🚀 Quick Solution: Scoring Adjustment**

**Instead of reverse engineering, let's adjust our projections based on your league's scoring:**

Your league settings:
- **0.5 points per rushing first down** 
- **Half PPR (0.5 per reception)**
- **Custom defensive scoring**

**The difference between 22.04 vs 22.0424 suggests:**
1. **Rounding differences**
2. **League-specific adjustments** 
3. **Real-time vs cached data**

---

## **💡 Immediate Fix Options**

### **Option 1: Manual Browser Investigation**
1. Follow the network guide above
2. Find the exact API endpoint
3. Copy headers/authentication
4. Implement in our code

### **Option 2: League Scoring Adjustment**  
```javascript
// Apply your league's exact scoring rules to generic projections
function adjustProjectionForLeague(genericProjection, playerData, leagueSettings) {
  let adjusted = genericProjection.pts_half_ppr;
  
  // Add your custom scoring adjustments
  if (leagueSettings.rushing_first_down === 0.5) {
    adjusted += (playerData.rush_fd || 0) * 0.5;
  }
  
  return Math.round(adjusted * 100) / 100; // Match precision
}
```

### **Option 3: Web Scraping**
```javascript
// Use Puppeteer to scrape the actual Sleeper app
const projections = await puppeteer.scrapeSleeperProjections(leagueId, week);
```

---

## **🎯 Most Likely Solution**

Based on the data you showed, the other site is probably:

1. **Using authenticated Sleeper web app APIs** (with session cookies)
2. **Applying real-time league scoring adjustments**  
3. **Accessing internal/protected endpoints** not available publicly

**Next Step:** Can you do a quick browser network investigation and share what API calls you see when viewing a matchup with projections?
