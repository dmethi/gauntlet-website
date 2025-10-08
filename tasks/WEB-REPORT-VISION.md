# WEB-REPORT: LLM-Powered Report Generation System — Vision

**Status**: 📝 Draft Vision Document  
**Last Updated**: October 8, 2025  
**Estimated Effort**: 12-16 hours (architectural design + implementation)

---

## 🎯 Executive Summary

Build an **LLM-powered orchestration system** using LangGraph that automatically
generates two types of fantasy football reports:

1. **Weekly Previews** (pre-game, Thursday): Matchup predictions, key
   storylines, must-watch games
2. **Weekly Recaps** (post-game, Tuesday): Game results, narratives, power
   rankings, hall of fame

The system uses a **single-agent architecture** with **Google Gemini 1.5 Pro**
(free API access) and an **audit-edit loop** for fact-checking:

- ✅ Tool-based architecture (each section = 1 tool call)
- ✅ Automated data fetching from Sleeper API
- ✅ Comprehensive fact-checking with auto-correction
- ✅ Cost: **$0** (using free Gemini API)
- ✅ Time savings: 2-3 hours → 10 minutes per report

---

## 📊 Report Types & Required Data

### Report Type 1: Weekly Previews (Pre-Game)

**Purpose**: Set up the week's storylines, predictions, and key matchups to
watch

**Sections** (each = 1 tool call):

| Section                       | Data Needed                                               | Source                      | Est. Token Size |
| ----------------------------- | --------------------------------------------------------- | --------------------------- | --------------- |
| **League Overview**           | Season standings, recent trends, playoff picture          | Sleeper API                 | ~2K tokens      |
| **Matchup Predictions**       | Projected scores, win probabilities, key players          | Sim Engine API + Sleeper    | ~8K tokens      |
| **Storylines & Rivalries**    | Historical H2H, season context, streak data               | Sleeper API + Historical DB | ~3K tokens      |
| **Must-Watch Games**          | Highest stakes, closest projections, playoff implications | Sim Engine + Sleeper        | ~2K tokens      |
| **Injury & Lineup Watch**     | Questionable players, start/sit decisions                 | Sleeper API                 | ~1K tokens      |
| **Power Rankings (Pre-Week)** | Current standings, momentum metrics                       | Historical + Sleeper        | ~2K tokens      |

**Total Input**: ~18K tokens per preview report

---

### Report Type 2: Weekly Recaps (Post-Game)

**Purpose**: Analyze results, tell stories, crown champions, identify trends

**Sections** (each = 1 tool call):

| Section                         | Data Needed                                         | Source                  | Est. Token Size |
| ------------------------------- | --------------------------------------------------- | ----------------------- | --------------- |
| **League Overview**             | Week results, biggest surprises, key outcomes       | Sleeper API             | ~2K tokens      |
| **Matchup Narratives (x12)**    | Box scores, player performances, game flow          | Sleeper API             | ~10K tokens     |
| **Hall of Fame**                | Top performances, biggest blowouts, clutch moments  | Sleeper API + Analytics | ~2K tokens      |
| **Hall of Shame**               | Worst performances, biggest busts, bad beats        | Sleeper API + Analytics | ~2K tokens      |
| **Power Rankings (Post-Week)**  | Updated standings, momentum shifts, tier changes    | Sleeper + Analytics     | ~3K tokens      |
| **Standings & Playoff Picture** | Division standings, playoff odds, elimination watch | Sleeper API             | ~2K tokens      |
| **Upcoming Preview**            | Next week's matchups, records, key storylines       | Sleeper API             | ~2K tokens      |
| **Closing Commentary**          | Meta-analysis, season narrative, big picture        | All above data          | ~1K tokens      |

**Total Input**: ~24K tokens per recap report

---

## 🏗️ Architecture Decision: Single Agent vs Multi-Agent

### Option A: Single Agent with Tool Calls (RECOMMENDED ✅)

**Pros**:

- ✅ **Shared context**: Agent sees all data, can cross-reference sections
- ✅ **Simpler orchestration**: One conversation, sequential tool calls
- ✅ **Better narrative coherence**: Same voice/style across all sections
- ✅ **Easier debugging**: Single trace to inspect
- ✅ **Token efficiency**: ~25K input fits in Gemini 1.5 Pro's 2M token context
  (yes, 2 MILLION!)

**Cons**:

- ❌ Slower: Sequential processing, can't parallelize
- ❌ Single point of failure: If agent fails, entire report fails

**Architecture**:

```
┌──────────────────────────────────────────────────────┐
│              LangGraph Orchestrator                  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │      Google Gemini 1.5 Pro Agent             │  │
│  │   (2M token context, function calling)       │  │
│  └───────────────────────────────────────────────┘  │
│                        │                             │
│            ┌───────────┴──────────┐                 │
│            │   Tool Calls (async) │                 │
│            └───────────┬──────────┘                 │
│                        │                             │
│  ┌─────────────────────┼────────────────────────┐   │
│  │                     │                        │   │
│  ▼                     ▼                        ▼   │
│ FetchData       GenerateSection         Audit&Edit │
│ (Sleeper API)   (Narrative + Style)     (Loop)     │
│                                                      │
│  Audit-Edit Loop:                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │ Generate → Audit → [Pass?]                   │  │
│  │              ├─ Yes → Next Section           │  │
│  │              └─ No → Regenerate (max 2×)     │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### Option B: Multi-Agent System

**Pros**:

- ✅ **Parallel processing**: Multiple sections generated simultaneously
- ✅ **Specialized agents**: Each agent optimized for its task
- ✅ **Fault isolation**: One agent failure doesn't kill entire report

**Cons**:

- ❌ **Context fragmentation**: Agents don't share state, risk contradictions
- ❌ **Complex orchestration**: Need supervisor agent + task routing
- ❌ **Inconsistent voice**: Different agents may produce different tones/styles
- ❌ **Higher cost**: More API calls, duplicated context
- ❌ **Harder to debug**: Multiple traces to inspect

**Architecture**:

```
┌──────────────────────────────────────────────────────┐
│              LangGraph Supervisor                    │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │         Claude Supervisor Agent            │     │
│  │  (Routes tasks, aggregates results)        │     │
│  └────────────────────────────────────────────┘     │
│                      │                              │
│       ┌──────────────┼──────────────┐              │
│       │              │              │              │
│       ▼              ▼              ▼              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐         │
│  │Matchup  │   │Power    │   │Hall of  │         │
│  │Agent    │   │Rankings │   │Fame Agt │   ...   │
│  │         │   │Agent    │   │         │         │
│  └─────────┘   └─────────┘   └─────────┘         │
└──────────────────────────────────────────────────────┘
```

---

### **Recommendation: Option A (Single Agent) ✅**

**Rationale**:

1. **Token budget is tiny**: 25K tokens << 2M Gemini context (we're using 1.25%
   of capacity!)
2. **Narrative coherence matters**: Reports should have consistent voice/style
3. **Simpler = more reliable**: Easier to test, debug, maintain
4. **Latency acceptable**: ~60-90 seconds for full report is fine (not
   real-time)
5. **Cost efficiency**: FREE with Gemini API (vs $4.76/season with Claude)
6. **Function calling**: Gemini has excellent tool calling support

We can always migrate to multi-agent later if needed (e.g., if reports grow to
500K+ tokens or we need parallel speed).

### Why Gemini Over Claude?

**Gemini 1.5 Pro Advantages**:

- ✅ **Free API access** for this user (vs $4.76/season for Claude)
- ✅ **2M token context** (10x larger than Claude's 200K)
- ✅ **Excellent function calling** (proven in production)
- ✅ **Great for factual tasks** (our primary use case)
- ✅ **Fast inference** with Gemini 2.0 Flash option

**When Claude would be better**:

- If extremely high-quality creative writing is needed (subjective)
- If we didn't have free Gemini access
- If we needed specific Claude features

**Decision**: Use Gemini 1.5 Pro. The free cost + massive context makes this a
no-brainer.

---

## 🔧 System Components

### 1. Data Layer

**Purpose**: Fetch and prepare all data for LLM consumption

**Tools**:

- `fetch_league_data(week)` → Standings, rosters, matchups
- `fetch_matchup_details(league_id, week)` → Box scores, player stats
- `fetch_projections(week)` → Upcoming week predictions (for previews)
- `fetch_simulations(week)` → Win probabilities, score distributions
- `fetch_historical_context(team_a, team_b)` → H2H records, season trends
- `fetch_power_rankings(week)` → Pre/post-week rankings

**Output**: Structured JSON documents optimized for LLM consumption

---

### 2. Orchestration Layer (LangGraph)

**Purpose**: Coordinate tool calls, manage state, handle errors

**Graph Structure**:

```python
START
  ↓
FETCH_DATA (parallel tools)
  ↓
VALIDATE_DATA (ensure completeness)
  ↓
GENERATE_SECTION_1 (League Overview)
  ↓
GENERATE_SECTION_2 (Matchups)
  ↓
GENERATE_SECTION_3 (Hall of Fame)
  ↓
... (other sections)
  ↓
AUDIT_NARRATIVES (fact-check)
  ↓
ASSEMBLE_REPORT (combine all sections)
  ↓
OUTPUT_JSON
  ↓
END
```

**State Management**:

- Report type (preview/recap)
- Week number
- Fetched data cache
- Generated sections
- Audit results
- Final report JSON

---

### 3. Narrative Generation Layer

**Purpose**: Generate engaging, accurate prose from structured data

**Prompt Engineering**:

- **System Prompt**: Define voice, style, constraints (fact-based, no
  hallucinations)
- **Section Prompts**: Template for each section type
- **Data Context**: Structured data + historical context
- **Examples**: Few-shot examples of high-quality narratives

**Quality Controls**:

- Length limits (e.g., matchup recaps = 200-300 words)
- Required elements (team names, scores, key players)
- Prohibited patterns (speculation, uncertain language)

---

### 4. Validation & Auditing Layer (with Edit Loop)

**Purpose**: Prevent hallucinations, ensure factual accuracy, auto-correct
errors

**Audit Checks**:

- ✅ All mentioned scores match actual data
- ✅ Player names exist in roster data
- ✅ Team records are accurate
- ✅ No contradictions between sections
- ✅ All required sections present
- ✅ No speculative/uncertain language

**Audit-Edit Loop**:

```
GENERATE_SECTION
  ↓
AUDIT_SECTION
  ↓
[Passed?]
  ├─ YES → Move to next section
  └─ NO  → REGENERATE with error context
       ↓
     AUDIT again
       ↓
     [Passed or retries exhausted?]
       ├─ YES → Move to next section
       └─ NO  → Flag for manual review
```

**Why Edit Loop?**:

- Cheaper than manual review (free API!)
- Catches errors immediately
- Usually fixes on first retry (~80% success rate expected)
- Max 2 retries per section to avoid infinite loops
- Falls back to manual review if unfixable

**Output**: Audit report with errors, warnings, and regeneration history

---

### 5. Output Layer

**Purpose**: Format final report for web consumption

**Outputs**:

- `report-week{N}.json` → Structured data for Next.js page
- `report-week{N}-audit.json` → Audit results for review
- `report-week{N}-metadata.json` → Generation stats (tokens, time, cost)

---

## 📐 Data Utilities & Schemas

### Core Types

```typescript
// Report metadata
interface ReportMetadata {
  season: string;
  week: number;
  reportType: 'preview' | 'recap';
  generatedAt: string;
  dataSource: 'automated-orchestrator';
  generationStats: {
    totalTokens: number;
    totalCost: number;
    durationMs: number;
    auditPassed: boolean;
  };
}

// Section definitions
interface ReportSection {
  sectionId: string; // 'league_overview', 'matchup_afc_1', etc.
  title: string;
  content: string; // Generated narrative
  wordCount: number;
  generatedAt: string;
  auditStatus: 'passed' | 'warnings' | 'failed';
  dataHash: string; // Hash of source data for traceability
}

// Complete report
interface Report {
  metadata: ReportMetadata;
  sections: ReportSection[];
  leagues: LeagueReportData[];
  powerRankings: PowerRanking[];
  standings: Standings[];
  hallOfFame?: HallOfFameEntry[];
  upcoming?: UpcomingMatchup[];
}
```

---

## 🧪 Testing & Validation Strategy

### Unit Tests

- Test each data fetcher independently
- Validate data schemas
- Test audit functions on sample narratives

### Integration Tests

- Full pipeline with Week 5 data (already have manually-written narratives for
  comparison)
- Compare automated vs manual narratives for quality
- Validate audit system catches known errors

### Manual Review Process

1. Generate report
2. Review audit results
3. Read narratives for tone/quality
4. Spot-check 3-5 facts manually
5. Approve or regenerate

---

## 📈 Success Metrics

### Accuracy

- [ ] **100% factual accuracy** (no hallucinated scores/names)
- [ ] **Zero audit failures** on production runs
- [ ] **95%+ match rate** with actual data

### Quality

- [ ] **Engaging prose** (subjective, human review)
- [ ] **Consistent voice** across all sections
- [ ] **Appropriate length** (200-300 words per matchup)

### Efficiency

- [ ] **< 90 seconds** total generation time
- [ ] **< $0.50** total cost per report
- [ ] **< 10 minutes** human review time

### Reliability

- [ ] **100% uptime** (no crashes)
- [ ] **Graceful degradation** (fallback to manual if automation fails)
- [ ] **Clear error messages** for debugging

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (4-5 hours)

**Goal**: Data layer + basic orchestration

**Tasks**:

1. Set up LangGraph project structure
2. Implement data fetchers (Sleeper API wrappers)
3. Define report schemas/types
4. Build basic orchestration graph (data fetch → assemble)
5. Test with Week 5 data

**Deliverables**:

- `lib/reports/data/` (fetchers)
- `lib/reports/schemas.ts` (types)
- `lib/reports/orchestrator.ts` (LangGraph graph)

---

### Phase 2: Narrative Generation (4-5 hours)

**Goal**: LLM-powered narrative writing

**Tasks**:

1. Design system prompts for each section type
2. Implement LangGraph tools for narrative generation
3. Add section-specific prompt templates
4. Test narrative quality with Week 5 comparison
5. Iterate on prompts based on output quality

**Deliverables**:

- `lib/reports/prompts/` (system & section prompts)
- `lib/reports/tools/narrative-tools.ts` (LangGraph tools)
- Sample outputs for Week 5 (comparison with manual)

---

### Phase 3: Validation & Auditing (2-3 hours)

**Goal**: Fact-checking and quality control

**Tasks**:

1. Implement audit functions (score checks, name validation, etc.)
2. Build audit tool for LangGraph
3. Add audit report generation
4. Test with known good/bad narratives
5. Integrate audit into orchestration graph

**Deliverables**:

- `lib/reports/tools/audit-tools.ts`
- `lib/reports/auditor.ts`
- Audit test suite

---

### Phase 4: CLI & Output (2-3 hours)

**Goal**: User-friendly script + JSON output

**Tasks**:

1. Build CLI script (`npm run generate-report <week> <type>`)
2. Implement JSON output formatters
3. Add progress logging
4. Add error handling & recovery
5. Document usage

**Deliverables**:

- `scripts/generate-report.ts` (CLI)
- `lib/reports/output.ts` (formatters)
- README.md section

---

## 💰 Cost Analysis

### Per-Report Costs (Gemini 1.5 Pro - Free Tier)

**With Free Gemini API Access**:

- Preview: **$0.00** per report
- Recap: **$0.00** per report
- Season Cost (17 weeks): **$0.00 total**

**Rate Limits (Free Tier)**:

- 15 requests per minute (RPM)
- 1M tokens per minute (TPM)
- 1,500 requests per day (RPD)

**Our Usage**:

- ~30 tokens/section × 20 sections = ~600K tokens per recap
- ~30 tokens/section × 6 sections = ~180K tokens per preview
- Well within 1M TPM limit
- 1 report = ~20 tool calls = well within 15 RPM

**If we exceeded free tier** (Google AI Studio pricing):

- Input: ~$0.00015/1K tokens
- Output: ~$0.0006/1K tokens
- Recap cost: ~$0.004 per report
- Preview cost: ~$0.003 per report
- Season cost: **~$0.12 total** (still 40x cheaper than Claude!)

**Comparison**: | Model | Season Cost | Context | Quality |
|-------|-------------|---------|---------| | Gemini 1.5 Pro (Free) | **$0.00**
| 2M tokens | Excellent | | Gemini 1.5 Pro (Paid) | $0.12 | 2M tokens |
Excellent | | Claude 3.5 Sonnet | $4.76 | 200K tokens | Excellent | | GPT-4
Turbo | $8.50 | 128K tokens | Excellent |

**Decision**: Gemini is a no-brainer. Free + massive context + great quality.

---

## 🚀 Migration Strategy

### Week 6 Onward

1. **Week 6**: Generate recap with new system, compare to manual (parallel)
2. **Week 7**: Use automated recap as draft, manually edit
3. **Week 8**: Ship automated recap with minimal edits
4. **Week 9+**: Fully automated recaps + previews

### Rollback Plan

If automated system fails:

1. Manual report as fallback (existing process)
2. Debug automated system offline
3. Fix issues before next week

---

## 🎓 Technical Stack

### Core Technologies

- **LangGraph**: Orchestration framework (state management, tool calling)
- **Google Gemini 1.5 Pro**: LLM for narrative generation (2M context, free API)
- **TypeScript**: All code (matches existing codebase)
- **Sleeper API**: Data source (via unified client)
- **Next.js**: Web framework (existing)

### New Dependencies

```json
{
  "dependencies": {
    "@langchain/core": "^0.2.0",
    "@langchain/langgraph": "^0.0.20",
    "@langchain/google-genai": "^0.0.15",
    "@google/generative-ai": "^0.1.3"
  }
}
```

### Environment Variables

```bash
GOOGLE_API_KEY="AIza..."  # Free Gemini API key
```

---

## ✅ Decisions Made (October 8, 2025)

1. **Should we generate previews for Week 6 onwards?**
   - ✅ **YES** — Previews on Thursday, Recaps on Tuesday

2. **Do we want user-editable sections?**
   - ✅ **NO** (for now) — If needed, systemize observations later

3. **Should audit failures block publication?**
   - ✅ **YES** (with edit loop) — Auto-regenerate failed sections up to 2×
     retries

4. **Do we need human-in-the-loop approval?**
   - ✅ **NO** — Trust the audit system, manual review optional

5. **Should we support custom narrative styles?**
   - ✅ **NO** (for now) — Base on existing Week 5 style, defer to V2

6. **Claude vs Gemini?**
   - ✅ **GEMINI** — Free API, 2M context, excellent quality

---

## 🎯 Next Steps

1. **Review this vision doc** with stakeholders
2. **Answer open questions** above
3. **Set up LangGraph project** (Phase 1 start)
4. **Generate Week 5 report** as proof-of-concept
5. **Compare automated vs manual** Week 5 for quality baseline

---

## 📚 References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Existing Report Structure](../apps/web/data/report-week5.json)
- [Sleeper API Docs](https://docs.sleeper.app/)

---

**Let's build this! 🚀**
