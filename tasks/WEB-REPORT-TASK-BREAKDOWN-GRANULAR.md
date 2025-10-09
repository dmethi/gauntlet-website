# WEB-REPORT: Granular Task Breakdown

**Total Projects**: 2 (Recap + Preview)  
**Total Tasks**: ~45 tasks (29 recap + 16 preview)  
**Estimated Time**: 20-24 hours total

---

## 🎯 Project Structure

Each report follows this lifecycle:

### Phase 1: Setup (5 tasks, ~3-4 hours)

1. Initialize LangGraph
2. Connect to Gemini API
3. Build tool integration framework
4. Create base prompt system
5. Define TypeScript types

### Phase 2: Section-by-Section Implementation (10-12 tasks, ~6-8 hours)

- Each section = 1-2 tasks (depending on complexity)
- Implements data fetching tool
- Adds section-specific prompt
- Tests narrative generation
- Optimizes context usage

### Phase 3: Report Assembly & UI (3 tasks, ~2-3 hours)

1. Orchestrate all sections
2. Generate JSON output
3. Build React UI component

### Phase 4: Audit System (3 tasks, ~2-3 hours)

1. Implement audit functions
2. Build audit-edit loop
3. Integrate into orchestration

---

## 📋 PROJECT 1: Weekly Recap Reports

**Goal**: Generate Tuesday recap reports with game flow, narratives, and insights. Fully automated via cron job with manual override capability.

**Total Time**: 14-16 hours  
**Total Tasks**: 29 tasks

---

### PHASE 1: Setup & Foundation (~3-4 hours)

#### **RECAP-001: LangGraph Initialization** (45 min)

- Set up LangGraph project structure
- Install dependencies (@langchain/langgraph, @langchain/google-genai)
- Create basic StateGraph with empty nodes
- Test graph execution with dummy data

**Deliverables**:

- `lib/reports/recap/orchestrator.ts` (basic graph)
- Test script confirms graph runs

---

#### **RECAP-002: Gemini API Integration** (30 min)

- Set up Gemini API client
- Test function calling with simple tool
- Validate API key works
- Handle rate limits gracefully

**Deliverables**:

- `lib/reports/recap/gemini-client.ts`
- Environment variable validation

---

#### **RECAP-003: Tool Integration Framework** (1 hour)

- Create base tool interface
- Implement tool registry system
- Build tool call executor
- Add error handling for tool failures

**Deliverables**:

- `lib/reports/recap/tools/base.ts` (tool interface)
- `lib/reports/recap/tools/registry.ts` (tool manager)
- Example tool implementation

---

#### **RECAP-004: Prompt System Foundation** (1 hour)

- Create system prompt template
- Build section prompt builder
- Implement prompt compression utilities
- Add context window monitoring

**Deliverables**:

- `lib/reports/recap/prompts/system.ts`
- `lib/reports/recap/prompts/sections/` (directory)
- `lib/reports/recap/prompts/utils.ts` (compression helpers)

---

#### **RECAP-005: TypeScript Types & Schemas** (45 min)

- Define all report data types
- Create section result interfaces
- Build validation schemas (Zod)
- Document type relationships

**Deliverables**:

- `lib/reports/recap/types.ts` (all types)
- `lib/reports/recap/schemas.ts` (Zod schemas)

---

### PHASE 2: Section-by-Section Implementation (~6-8 hours)

**Strategy**: Implement sections in dependency order, test each before moving on

---

#### **RECAP-006: League Overview Section** (45 min)

- Implement `fetch_league_data` tool
- Implement `calculate_week_summary_stats` tool
- Create league overview prompt template
- Test narrative generation
- Validate output format

**Deliverables**:

- `lib/reports/recap/tools/league-overview.ts`
- `lib/reports/recap/prompts/sections/league-overview.ts`
- Test with Week 5 data

---

#### **RECAP-007: Game Flow Data Compression** (1 hour)

- Implement time-series compression algorithm
- Build `fetch_game_flow_compressed` tool
- Calculate derived metrics (lead changes, excitement score)
- Test with 5-min cron data

**Deliverables**:

- `lib/reports/recap/tools/game-flow.ts`
- `lib/reports/recap/utils/compress-time-series.ts`
- Compression tests (36 points → 5-8)

---

#### **RECAP-008: Matchup Narratives - Data Layer** (1.5 hours)

- Implement all matchup data fetching tools (11 tools)
- Combine box scores, projections, records, H2H history
- Add game flow compressed data
- Test data completeness

**Deliverables**:

- `lib/reports/recap/tools/matchup-data.ts` (all 11 tools)
- Integration test with Week 5 matchup

---

#### **RECAP-009: Matchup Narratives - Generation** (1 hour)

- Create matchup narrative prompt template
- Include game flow context in prompt
- Test narrative generation for 1 matchup
- Iterate on prompt quality

**Deliverables**:

- `lib/reports/recap/prompts/sections/matchup-narrative.ts`
- Example output for Week 5 game

---

#### **RECAP-010: Matchup Narratives - Batch Processing** (30 min)

- Implement batch processing for 12 matchups
- Optimize context usage (clear after each)
- Add progress logging
- Handle failures gracefully

**Deliverables**:

- Batch processor in orchestrator
- Handles 12 matchups sequentially

---

#### **RECAP-011: Hall of Fame Section** (45 min)

- Implement `calculate_top_team_score` tool
- Implement `calculate_biggest_blowout` tool
- Implement `calculate_top_position_performers` tools
- Create Hall of Fame prompt
- Test generation

**Deliverables**:

- `lib/reports/recap/tools/hall-of-fame.ts`
- `lib/reports/recap/prompts/sections/hall-of-fame.ts`

---

#### **RECAP-012: Hall of Shame Section** (45 min)

- Implement `calculate_lowest_team_score` tool
- Implement `calculate_biggest_busts` tool
- Implement `calculate_bad_beat_losses` tool
- Create Hall of Shame prompt
- Test generation

**Deliverables**:

- `lib/reports/recap/tools/hall-of-shame.ts`
- `lib/reports/recap/prompts/sections/hall-of-shame.ts`

---

#### **RECAP-013: Power Rankings Commentary** (45 min)

- Implement `fetch_power_rankings` tool (current + previous week)
- Calculate ranking changes
- Create power rankings prompt
- Test generation

**Deliverables**:

- `lib/reports/recap/tools/power-rankings.ts`
- `lib/reports/recap/prompts/sections/power-rankings.ts`

---

#### **RECAP-014: Standings & Playoff Picture** (30 min)

- Implement `fetch_standings` tool
- Calculate playoff seeds
- Format standings data
- (Minimal narrative generation, mostly data)

**Deliverables**:

- `lib/reports/recap/tools/standings.ts`
- Standings data formatter

---

#### **RECAP-015: Upcoming Matchups Preview** (30 min)

- Implement `fetch_next_week_matchups` tool
- Format upcoming matchups
- Create brief preview prompt
- Test generation

**Deliverables**:

- `lib/reports/recap/tools/upcoming.ts`
- `lib/reports/recap/prompts/sections/upcoming.ts`

---

#### **RECAP-016: Closing Commentary** (30 min)

- Aggregate all section data
- Create big-picture prompt
- Test generation
- Ensure forward-looking tone

**Deliverables**:

- `lib/reports/recap/prompts/sections/closing.ts`
- Uses aggregated data from all sections

---

### PHASE 3: Complete Automation System (~6-8 hours)

**📚 Phase 3 Resources:**
- **📋 Detailed Tasks:** [`RECAP-PHASE-3-DETAILED.md`](./RECAP-PHASE-3-DETAILED.md) - Full specifications for all 10 tasks
- **🏗️ Architecture:** [`RECAP-PHASE-3-ARCHITECTURE.md`](./RECAP-PHASE-3-ARCHITECTURE.md) - System design and data flow
- **🚀 Quick Start:** [`RECAP-PHASE-3-QUICKSTART.md`](./RECAP-PHASE-3-QUICKSTART.md) - Step-by-step implementation guide

This phase transforms individual sections into a complete production system with:
- Full LangGraph orchestration
- File system storage with backups
- Dynamic page generation
- Homepage integration (auto-updates competition page)
- CLI tool for manual generation
- Vercel Cron automation (weekly Tuesday runs)
- Error recovery and monitoring
- Complete documentation

#### **RECAP-017: Complete Graph Orchestration** (1.5 hours)

- Wire all sections into LangGraph (league overview, matchups, hall of fame/shame, power rankings, standings, upcoming, closing)
- Implement parallel processing where possible
- Add section-level error boundaries
- Track progress metadata (tokens, timing, success/failure)
- Test full pipeline with Week 5

---

#### **RECAP-018: JSON Report Output** (45 min)

- Format LangGraph state into `WeeklyRecapReport` type
- Match existing `report-week5.json` structure
- Add comprehensive metadata (timing, tokens, errors, version)
- Validate output against schema
- Handle partial failures gracefully

---

#### **RECAP-019: File System Storage** (1 hour)

- Save reports to `data/reports/recap/{season}/week-{N}.json`
- Create directory structure automatically
- Add backup/versioning (keep previous version)
- Implement atomic writes (temp file → rename)
- Track generation history metadata

---

#### **RECAP-020: Dynamic Page Generation** (1.5 hours)

- Generate/update Next.js pages at `/competition/reports/{season}/week-{N}`
- Use dynamic route approach: `[season]/week-[week]/page.tsx`
- Create loading/error states
- Add SEO metadata
- Match existing report styling (Week 5)

---

#### **RECAP-021: Homepage Integration** (1 hour)

- Auto-update `/competition/page.tsx` reports section
- Auto-update `/competition/reports/page.tsx` feed
- Data-driven approach (scan file system)
- Show latest report with badge
- Sort by date descending

---

#### **RECAP-022: CLI Tool** (1 hour)

- Create `scripts/generate-recap.ts` CLI
- Support `--week`, `--season`, `--force`, `--dry-run` flags
- Progress indicators with ora/chalk
- Display summary (tokens, time, status)
- Add to package.json scripts

---

#### **RECAP-023: Cron Job Setup** (1 hour)

- Create `/api/cron/recap-report/route.ts`
- Configure Vercel Cron (Tuesday 10am ET)
- Add authentication with `CRON_SECRET`
- Implement timeout handling (5 min max)
- Add success/failure notifications (Slack/email)

---

#### **RECAP-024: Error Recovery System** (1 hour)

- Handle partial failures gracefully
- Implement retry logic for transient failures
- Save partial reports with error markers
- Log detailed error context
- Alert on critical failures

---

#### **RECAP-025: Monitoring & Logging** (45 min)

- Log all generation attempts with metadata
- Track success/failure rates
- Monitor generation time and token usage
- Store logs in structured format (JSON)
- Create query/dashboard interface

---

#### **RECAP-026: Documentation & Deployment** (45 min)

- Write comprehensive README
- Document CLI usage and cron setup
- Create troubleshooting guide
- Add architecture diagram
- Document environment variables

---

### PHASE 4: Audit System (~2-3 hours)

**Note:** Phase 4 can be implemented in parallel with or after Phase 3 completion.

#### **RECAP-027: Audit Functions** (1 hour)

- Implement `validate_scores` function (check against actual matchup data)
- Implement `validate_player_names` function (check against Sleeper player database)
- Implement `validate_records` function (check win/loss records)
- Implement `detect_hallucinations` function (LLM fact-checking)
- Test with known good/bad narratives

**Deliverables**:

- `lib/reports/recap/audit/validators.ts`
- Unit tests for each validator

---

#### **RECAP-028: Audit-Edit Loop** (1 hour)

- Build regeneration logic with error context
- Implement retry mechanism (max 2× per section)
- Add audit result tracking in report metadata
- Test with intentionally broken narratives

**Deliverables**:

- `lib/reports/recap/audit/edit-loop.ts`
- Integration into orchestrator graph
- Audit metrics in report metadata

---

#### **RECAP-029: Audit Integration & Testing** (1 hour)

- Integrate audit into full pipeline (between generation and output)
- Add audit quality checks to CLI output
- Create audit report visualization
- Final end-to-end test with audit enabled

**Deliverables**:

- Audit integrated into orchestrator
- CLI shows audit results
- Complete Week 5 test with audit passing
- Audit quality dashboard (optional)

---

## 📋 PROJECT 2: Weekly Preview Reports

**Goal**: Generate Thursday preview reports with matchup timelines, decisions,
and odds

**Total Time**: 8-10 hours  
**Total Tasks**: 18 tasks

---

### PHASE 1: Setup & Foundation (2-3 hours)

**Note**: Reuses much of Recap setup, so faster

---

#### **PREVIEW-001: LangGraph Setup for Preview** (30 min)

- Copy/adapt Recap orchestrator
- Configure for preview workflow
- Test with dummy data

**Deliverables**:

- `lib/reports/preview/orchestrator.ts`

---

#### **PREVIEW-002: Preview-Specific Tools Framework** (30 min)

- Adapt tool registry for preview
- Add preview-specific tool interfaces
- Test tool execution

**Deliverables**:

- `lib/reports/preview/tools/base.ts`

---

#### **PREVIEW-003: Preview Prompt System** (45 min)

- Create preview system prompt (different tone from recap)
- Build section prompts for preview sections
- Test prompt quality

**Deliverables**:

- `lib/reports/preview/prompts/system.ts`
- `lib/reports/preview/prompts/sections/` (directory)

---

#### **PREVIEW-004: Preview Types & Schemas** (30 min)

- Define preview-specific types (timeslots, projections)
- Create validation schemas
- Document differences from recap types

**Deliverables**:

- `lib/reports/preview/types.ts`
- `lib/reports/preview/schemas.ts`

---

### PHASE 2: Section-by-Section Implementation (4-5 hours)

#### **PREVIEW-005: Week Overview & Storylines** (45 min)

- Implement `identify_key_storylines` tool
- Calculate hot/cold teams
- Create week overview prompt
- Test generation

**Deliverables**:

- `lib/reports/preview/tools/week-overview.ts`
- `lib/reports/preview/prompts/sections/week-overview.ts`

---

#### **PREVIEW-006: Timeslot Data Fetching** (1 hour)

- Implement `fetch_player_timeslots` tool
- Group players by game time
- Calculate cumulative score projections by timeslot
- Test with upcoming week data

**Deliverables**:

- `lib/reports/preview/tools/timeslots.ts`
- `lib/reports/preview/utils/timeslot-calculator.ts`

---

#### **PREVIEW-007: Matchup Timeslot Analysis** (1.5 hours)

- Build matchup-by-matchup timeslot breakdown
- Format for table/chart output
- Calculate projected score evolution
- Test with 1 matchup

**Deliverables**:

- `lib/reports/preview/tools/matchup-timeslots.ts`
- Table formatter for timeslot data

---

#### **PREVIEW-008: Must-Watch Game Scoring** (45 min)

- Implement must-watch scoring algorithm
- Calculate closeness, stakes, star power, rivalry
- Rank matchups by score
- Test with upcoming week

**Deliverables**:

- `lib/reports/preview/tools/must-watch.ts`
- `lib/reports/preview/utils/must-watch-scoring.ts`

---

#### **PREVIEW-009: Start/Sit Decision Detection** (1 hour)

- Implement `identify_tough_decisions` tool
- Calculate decision difficulty score
- Group by team
- Format recommendations

**Deliverables**:

- `lib/reports/preview/tools/start-sit-decisions.ts`
- Decision difficulty algorithm

---

#### **PREVIEW-010: Injury Report** (45 min)

- Implement `fetch_nfl_injury_report` tool
- Filter to Gauntlet-relevant injuries
- Calculate fantasy impact
- Format with recommendations

**Deliverables**:

- `lib/reports/preview/tools/injuries.ts`
- Impact calculator

---

#### **PREVIEW-011: Playoff Odds & Stakes** (45 min)

- Implement `calculate_playoff_odds_changes` tool
- Show current playoff picture
- Calculate this week's impact
- Format playoff scenarios

**Deliverables**:

- `lib/reports/preview/tools/playoff-odds.ts`
- Odds change simulator

---

### PHASE 3: Report Assembly & UI (1.5-2 hours)

#### **PREVIEW-012: Orchestration Integration** (1 hour)

- Wire all preview sections into graph
- Test full pipeline
- Handle section failures

**Deliverables**:

- Complete preview orchestration
- Test with upcoming week

---

#### **PREVIEW-013: JSON Output & UI** (1 hour)

- Format preview JSON
- Create preview page component
- Add timeslot charts/visualizations
- Test rendering

**Deliverables**:

- `lib/reports/preview/output.ts`
- Preview React component

---

### PHASE 4: Audit & CLI (1-2 hours)

#### **PREVIEW-014: Preview Audit Functions** (45 min)

- Adapt audit functions for preview
- Validate projections (vs actual available data)
- Test with preview output

**Deliverables**:

- `lib/reports/preview/audit/validators.ts`

---

#### **PREVIEW-015: Preview Audit-Edit Loop** (45 min)

- Integrate audit loop into preview
- Test regeneration
- Validate quality

**Deliverables**:

- `lib/reports/preview/audit/edit-loop.ts`

---

#### **PREVIEW-016: Preview CLI & Testing** (30 min)

- Build preview CLI script
- Add to npm scripts
- Final end-to-end test

**Deliverables**:

- `scripts/generate-preview.ts`
- Complete test run

---

## 📊 Task Dependency Map

### Recap Dependencies

```
PHASE 1: Setup (serial)
RECAP-001 → RECAP-002 → RECAP-003 → RECAP-004 → RECAP-005
                                         ↓
PHASE 2: Sections (mostly parallel)
RECAP-006 (league overview)
RECAP-007 (game flow compression)
RECAP-008 → RECAP-009 → RECAP-010 (matchup narratives - serial)
RECAP-011 (hall of fame - parallel)
RECAP-012 (hall of shame - parallel)
RECAP-013 (power rankings - parallel)
RECAP-014 (standings - parallel)
RECAP-015 (upcoming - parallel)
RECAP-016 (closing - after all sections)
                ↓
PHASE 3: Automation (serial)
RECAP-017 (orchestration) → RECAP-018 (JSON output) → 
RECAP-019 (file storage) → RECAP-020 (page generation) → 
RECAP-021 (homepage integration) → RECAP-022 (CLI tool) → 
RECAP-023 (cron setup) → RECAP-024 (error recovery) → 
RECAP-025 (monitoring) → RECAP-026 (documentation)
                ↓
PHASE 4: Audit (can be parallel with Phase 3 or after)
RECAP-027 (audit functions) → RECAP-028 (edit loop) → 
RECAP-029 (integration)
```

### Preview Dependencies

```
RECAP-005 (types foundation)
  ↓
PREVIEW-001 → PREVIEW-002 → PREVIEW-003 → PREVIEW-004
                                             ↓
PREVIEW-005 (can start after 004)
PREVIEW-006 → PREVIEW-007 (serial, timeslot pipeline)
PREVIEW-008 (parallel with 006-007)
PREVIEW-009 (parallel with 006-007)
PREVIEW-010 (parallel with 006-007)
PREVIEW-011 (parallel with 006-007)
                ↓
PREVIEW-012 → PREVIEW-013 (serial, assembly)
PREVIEW-014 → PREVIEW-015 → PREVIEW-016 (serial, audit)
```

---

## 🎯 Recommended Execution Order

### Week 1: Recap Foundation & Sections (8-10 hours)

- **Day 1-2**: RECAP-001 through RECAP-005 (setup)
- **Day 3-4**: RECAP-006, RECAP-007 (data sections)
- **Day 5-6**: RECAP-008, RECAP-009, RECAP-010 (matchup pipeline)
- **Day 7**: RECAP-011 through RECAP-016 (remaining sections)

### Week 2: Recap Automation System (6-8 hours)

- **Day 8-9**: RECAP-017, RECAP-018, RECAP-019 (orchestration + storage)
- **Day 10**: RECAP-020, RECAP-021 (page generation + homepage)
- **Day 11**: RECAP-022, RECAP-023 (CLI + cron)
- **Day 12**: RECAP-024, RECAP-025, RECAP-026 (error handling + monitoring + docs)

### Week 2-3: Recap Audit System (Optional, 2-3 hours)

- **Day 13**: RECAP-027, RECAP-028, RECAP-029 (audit system)

### Week 3: Preview System (8-10 hours)

- **Day 14-15**: PREVIEW-001 through PREVIEW-004 (setup)
- **Day 16-17**: PREVIEW-005 through PREVIEW-011 (sections)
- **Day 18-19**: PREVIEW-012 through PREVIEW-016 (assembly + audit)

---

## ✅ Task Completion Checklist Template

For each task, ensure:

- [ ] Code written and tested
- [ ] Types/schemas defined
- [ ] Unit tests pass (if applicable)
- [ ] Integration test with real data
- [ ] Documentation updated
- [ ] Linting/formatting passes
- [ ] Committed with task ID in message

---

## 📈 Progress Tracking

**Recap Progress**: 0/29 tasks (0%)  
- Phase 1 (Setup): 0/5 tasks
- Phase 2 (Sections): 0/11 tasks  
- Phase 3 (Automation): 0/10 tasks
- Phase 4 (Audit): 0/3 tasks

**Preview Progress**: 0/16 tasks (0%)  

**Overall Progress**: 0/45 tasks (0%)

**Estimated Completion**: 
- Part-time (2-3 hrs/day): ~3-4 weeks
- Full-time (6-8 hrs/day): ~1.5-2 weeks
- Recap only: ~2-3 weeks part-time, ~1 week full-time

---

## 🎉 Success Metrics

### Per Task:

- [ ] Runs without errors
- [ ] Produces expected output format
- [ ] Passes audit (where applicable)
- [ ] Token usage within budget
- [ ] Completes in < 5 minutes

### Per Project:

- [ ] Generates complete report for Week 5 (test)
- [ ] All narratives pass audit
- [ ] Output matches existing format
- [ ] UI renders correctly
- [ ] Total generation time < 90 seconds

### Overall:

- [ ] Can generate both reports for any week
- [ ] Audit-edit loop works < 80% of time
- [ ] CLI is user-friendly
- [ ] Documentation is complete
- [ ] Ready for Week 6 deployment

---

**Let's build this iteratively, one small task at a time! 🚀**
