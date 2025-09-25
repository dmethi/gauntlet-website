# AI-Powered Matchup Recap System

This system generates comprehensive statistical context for AI-driven matchup recaps, removing the need for manual annotations and providing rich, data-driven narratives.

## 🎯 System Overview

The system consists of three main components:

1. **Context Generation** (`generate-matchup-context.ts`) - Extracts comprehensive statistical context from your existing data
2. **Report Enhancement** (`enhance-report-with-context.ts`) - Enhances your weekly reports with AI-ready context
3. **AI Recap Generation** (`generate-ai-recaps.ts`) - Combines context with AI prompting to generate compelling recaps

## 📊 What Statistical Context Is Captured

### Matchup Flow Analysis
- **Win probability progression** throughout the game
- **Lead changes and momentum shifts**
- **Clutch moments** (high-leverage situations)
- **Pacing analysis** (scoring tempo and game rhythm)
- **Time leading breakdown** for each team

### Stakes & Context Assessment  
- **Power ranking context** (pre-game rankings and recent changes)
- **Season trajectory** (hot streaks, cold spells, trends)
- **Head-to-head rivalry history**
- **Playoff implications** and standings impact
- **Recent form** (last 3 games performance)

### Performance Analysis
- **Efficiency metrics** (points per starter, bench utilization)
- **Positional breakdowns** (which position groups carried/failed each team)
- **Player-level impact** (booms, busts, clutch performances)
- **Projection vs reality** analysis
- **Bench regret** and optimal lineup calculations

### Statistical Superlatives
- **Hall of Fame qualifying performances**
- **Weekly superlatives** and notable achievements  
- **Records set** (team and league level)
- **Unusual statistical occurrences**
- **Historical context** and ranking

### Narrative Elements
- **Game type classification** (blowout, thriller, defensive struggle, etc.)
- **Primary and secondary storylines**
- **Emotional beats** and dramatic moments
- **Season-long implications**
- **Quotable statistics** and memory makers

## 🚀 Quick Start

### Step 1: Generate Enhanced Context

```bash
# Enhance an entire week's report with AI context
npx tsx scripts/enhance-report-with-context.ts --week=2

# Or enhance with specific input/output files  
npx tsx scripts/enhance-report-with-context.ts --week=2 --input=./my-report.json --output=./enhanced.json
```

### Step 2: Generate AI Recaps

```bash
# Generate recaps for all matchups in a week (prompt-only mode)
npx tsx scripts/generate-ai-recaps.ts --week=2 --ai-service=prompt-only

# Generate recap for specific matchup
npx tsx scripts/generate-ai-recaps.ts --week=2 --matchupId=5 --ai-service=prompt-only

# With actual AI integration (when implemented)
npx tsx scripts/generate-ai-recaps.ts --week=2 --ai-service=openai --model=gpt-4 --api-key=your-key
```

### Step 3: Use Generated Content

The system produces ready-to-use prompts that you can copy into any AI chat interface (ChatGPT, Claude, etc.) to generate compelling matchup recaps.

## 📁 File Structure

```
scripts/
├── generate-matchup-context.ts    # Core context generation engine
├── enhance-report-with-context.ts # Report enhancement script  
├── generate-ai-recaps.ts          # AI recap generation
├── ai-recap-prompt.md             # Prompt template documentation
└── README-AI-Recaps.md           # This guide
```

## 🔧 Integration with Your Existing System

### Data Sources Used

The system integrates with your existing data structures:

- **Matchup data** from your weekly reports
- **Win probability samples** from `LiveWinProbSample` table
- **Hall of Fame records** from your achievement tracking
- **Power rankings** calculated from your existing formulas
- **Player performance data** from Sleeper API integration

### Confidence Scoring

Each generated context includes a confidence score based on:
- Completeness of matchup data
- Availability of win probability history  
- Depth of player performance data
- Hall of Fame/statistical superlatives present

### Error Handling

The system gracefully degrades when data is missing:
- Generates basic context even if advanced metrics fail
- Clearly identifies missing data components
- Provides fallback narratives for incomplete datasets

## 🎨 Customization Options

### Prompt Styling

Modify `ai-recap-prompt.md` to adjust:
- Writing tone and personality
- Length requirements  
- Focus areas (stats vs narrative vs humor)
- League-specific terminology

### Context Generation

Extend `MatchupContext` interface to add:
- Additional statistical metrics
- Team-specific historical context
- League-specific achievements
- Custom narrative elements

### AI Integration

Add your preferred AI service by implementing:
- API calls in `generate-ai-recaps.ts`
- Custom model parameters
- Response parsing and validation

## 📈 Example Output

### Enhanced Matchup Context
```json
{
  "basicInfo": {
    "teamA": { "teamName": "2 Dolla Balla$", "finalScore": 109.92 },
    "teamB": { "teamName": "Quonspiracy Theorists", "finalScore": 110.99 },
    "margin": 1.07,
    "winner": "teamB"
  },
  "flow": {
    "gameNarrative": "A nail-biter that came down to the wire, with Quonspiracy Theorists edging 2 Dolla Balla$ by just 1.1 points.",
    "keyMoments": ["4 lead changes kept fans on the edge of their seats"],
    "clutchMoments": [...]
  },
  "stakes": {
    "powerRankingContext": "Closely matched teams in power rankings (#8 vs #10)",
    "seasonImplications": ["Both teams fighting for playoff positioning"]
  },
  "performance": {
    "teamA": {
      "keyPerformers": ["Amon-Ra St. Brown: 35.2 points"],
      "efficiency": { "benchRegret": 12.4 }
    }
  },
  "aiContext": {
    "narrativeElements": {
      "primaryStoryline": "A thriller that lived up to its billing",
      "quotableStats": ["Final: 111.0-109.9", "4 lead changes"],
      "memoryMakers": ["A finish for the ages"]
    }
  }
}
```

### Generated AI Prompt
The system creates comprehensive prompts like:

```
Write an engaging matchup recap for this fantasy football game...

**MATCHUP**: 2 Dolla Balla$ vs Quonspiracy Theorists
**FINAL SCORE**: 111.0 - 109.9

## Statistical Context
### Game Flow
A nail-biter that came down to the wire, with Quonspiracy Theorists edging 2 Dolla Balla$ by just 1.1 points.

**Key Moments:**
- 4 lead changes kept fans on the edge of their seats
- Multiple clutch moments with win probability swings exceeding 20%

[... complete statistical context ...]

## Instructions
Create a compelling 3-4 paragraph matchup recap that opens with drama, tells the story using game flow data, highlights heroes and zeros, provides broader context, and ends memorably...
```

## 🔄 Workflow Integration

### For Weekly Reports

1. **Generate your standard weekly report data**
2. **Run enhancement script** to add AI context
3. **Generate AI recaps** for key matchups
4. **Review and edit** generated content as needed
5. **Publish** enhanced recaps with rich statistical backing

### For Individual Matchups

1. **Identify compelling matchups** (close games, upsets, record performances)
2. **Generate specific matchup context**
3. **Create targeted AI prompts** for detailed analysis
4. **Generate multiple recap variants** with different focuses
5. **Select best content** for publication

## 🚀 Future Enhancements

### Planned Features
- **Direct AI API integration** (OpenAI, Anthropic, local models)
- **Multi-style prompt generation** (serious, humorous, technical)  
- **Historical matchup context** (season series, all-time records)
- **Cross-league comparisons** and superlatives
- **Automated recap quality scoring**

### Potential Integrations
- **Social media optimization** (Twitter-length summaries)
- **Email newsletter formatting**
- **Podcast script generation**  
- **Video recap scripting**
- **Real-time recap generation** during games

## 🔧 Technical Details

### Dependencies
- TypeScript/Node.js execution environment
- Prisma ORM for database access
- Your existing Sleeper API integration
- File system access for report generation

### Performance
- Context generation: ~2-5 seconds per matchup
- Report enhancement: ~30-60 seconds per weekly report
- Scales linearly with number of matchups/leagues

### Data Privacy
- All processing happens locally
- No data sent to external services (unless AI integration enabled)
- Generated prompts can be reviewed before AI submission

## 💡 Tips for Best Results

### Content Strategy
1. **Focus on compelling matchups** - not every game needs AI enhancement
2. **Review generated context** before AI prompting for accuracy
3. **Customize prompts** for specific storylines or angles
4. **Combine multiple AI outputs** for comprehensive coverage

### Quality Control
1. **Verify statistical claims** in AI-generated content
2. **Ensure narrative consistency** with your league's voice
3. **Add personality** and inside jokes that AI might miss
4. **Cross-reference** with your manual observations

### Workflow Optimization
1. **Batch process** weekly reports for efficiency
2. **Pre-identify** key storylines for targeted enhancement
3. **Template common scenarios** (upsets, blowouts, etc.)
4. **Build custom prompt variants** for different purposes

---

This system transforms your rich statistical data into AI-ready narratives, dramatically reducing the manual work needed for compelling matchup recaps while ensuring every story is backed by comprehensive statistical context.
