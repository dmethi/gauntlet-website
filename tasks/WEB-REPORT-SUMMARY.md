# WEB-REPORT: LLM-Powered Report Generation System

**Category**: Reports  
**Total Tasks**: 4 (restructured)  
**Total Time**: ⏱️ 12-16 hours  
**Status**: 🟡 Vision Approved → Ready to Start

---

## 🎯 Goal

Build an **LLM-powered orchestration system** using LangGraph that automatically
generates two types of fantasy football reports:

1. **Weekly Previews** (pre-game): Matchup predictions, key storylines,
   must-watch games
2. **Weekly Recaps** (post-game): Game results, narratives, power rankings, hall
   of fame

The system uses a **single-agent architecture** with tool calls where each
report section corresponds to a tool, featuring:

- ✅ Automated data fetching from Sleeper API
- ✅ LLM-powered narrative generation (Google Gemini 1.5 Pro - **FREE API**)
- ✅ Comprehensive fact-checking with **audit-edit loop** (auto-correction)
- ✅ JSON output ready for Next.js pages
- ✅ Cost: **$0.00** (free Gemini API tier)

This system will reduce manual report generation from **2-3 hours to ~10
minutes** (final review only).

---

## 📋 Task Breakdown (Restructured for LangGraph)

### Phase 1: Foundation & Data Layer (4-5 hours)

**WEB-REPORT-001: Data Layer & LangGraph Setup**

- Set up LangGraph project structure
- Implement Sleeper API data fetchers as tools
- Define TypeScript schemas for reports (preview + recap)
- Build basic orchestration graph
- Test data fetching with Week 5 data

**Deliverables**:

- `apps/web/src/lib/reports/data/` (data fetchers)
- `apps/web/src/lib/reports/schemas.ts` (TypeScript types)
- `apps/web/src/lib/reports/orchestrator.ts` (LangGraph graph)
- `apps/web/src/lib/reports/tools/data-tools.ts` (LangGraph tools)

---

### Phase 2: LLM Narrative Generation (4-5 hours)

**WEB-REPORT-002: LLM-Powered Narrative Generation**

- Design system prompts for Google Gemini 1.5 Pro
- Implement narrative generation tools for each section type
- Create section-specific prompt templates (based on Week 5 style)
- Test narrative quality against Week 5 manual baseline
- Iterate on prompts based on output quality

**Deliverables**:

- `apps/web/src/lib/reports/prompts/` (system & section prompts)
- `apps/web/src/lib/reports/tools/narrative-tools.ts` (LangGraph narrative
  tools)
- Sample automated output for Week 5 comparison

**Note**: Using Gemini 1.5 Pro for free API access (2M token context)

**Blockers**: WEB-REPORT-001

---

### Phase 3: Validation & Auditing (2-3 hours)

**WEB-REPORT-003: Fact-Checking & Audit-Edit Loop**

- Implement audit functions (score validation, name checks, consistency)
- Build audit tool for LangGraph
- **Implement audit-edit loop** (auto-regenerate failed sections)
- Generate audit reports with errors/warnings/regeneration history
- Test with known good/bad narratives
- Integrate audit loop into orchestration graph (max 2 retries)

**Deliverables**:

- `apps/web/src/lib/reports/tools/audit-tools.ts` (LangGraph audit tools)
- `apps/web/src/lib/reports/auditor.ts` (audit logic + edit loop)
- Audit test suite

**Note**: Edit loop allows auto-correction of errors without manual intervention

**Blockers**: WEB-REPORT-001, WEB-REPORT-002

---

### Phase 4: CLI & Output System (2-3 hours)

**WEB-REPORT-004: CLI Script & Report Output**

- Build CLI script: `npm run generate-report <week> <type>`
- Implement JSON output formatters
- Add progress logging with LangGraph streaming
- Add error handling & graceful degradation
- Document usage and migration strategy

**Deliverables**:

- `apps/web/src/scripts/generate-report.ts` (CLI)
- `apps/web/src/lib/reports/output.ts` (formatters)
- npm script configuration
- README documentation

**Blockers**: WEB-REPORT-001, WEB-REPORT-002, WEB-REPORT-003

---

## 🚀 Execution Plan

### Sequential Approach (Recommended)

Complete tasks in order, with comprehensive testing:

```
Sprint 1 (Days 1-2):
  WEB-REPORT-001 (4-5 hours)
    - Set up LangGraph environment
    - Build data fetchers as tools
    - Define schemas
    - Test basic orchestration

Sprint 2 (Days 3-4):
  WEB-REPORT-002 (4-5 hours)
    - Design Claude prompts
    - Implement narrative tools
    - Generate Week 5 test output
    - Compare with manual baseline

Sprint 3 (Day 5):
  WEB-REPORT-003 (2-3 hours)
    - Build audit system
    - Test fact-checking
    - Integrate into graph

Sprint 4 (Day 6):
  WEB-REPORT-004 (2-3 hours)
    - Build CLI
    - Test full pipeline
    - Generate Week 6 preview/recap
    - Document usage
```

### Architecture: Single Agent with Tool Calls + Audit-Edit Loop

We're using a **single-agent architecture** (not multi-agent) because:

- ✅ Total input ~25K tokens fits in Gemini 1.5 Pro's 2M context (using 1.25% of
  capacity!)
- ✅ Better narrative coherence with shared context
- ✅ Simpler debugging and maintenance
- ✅ **Free API access** with Gemini vs $4.76/season with Claude

**Audit-Edit Loop**:

- Each section generated → audited → regenerated if errors (max 2× retries)
- Auto-corrects factual errors without manual intervention
- Falls back to manual review only if unfixable

See `WEB-REPORT-VISION.md` for detailed architecture analysis. See
`WEB-REPORT-SECTIONS-DETAILED.md` for granular section breakdown (20
sections/recap, 6 sections/preview).

---

## ✅ Success Criteria

### System-Level:

- [ ] Can generate complete Week N report with one command
- [ ] All data is accurate (passes audit)
- [ ] Narratives are engaging and factual
- [ ] Team/owner names resolve correctly
- [ ] Output JSON matches existing report structure

### Code Quality:

- [ ] All functions use arrow function syntax
- [ ] Comprehensive JSDoc on all exports
- [ ] TypeScript compilation with 0 errors
- [ ] ESLint with 0 errors
- [ ] Follows CODING_CONVENTIONS.MD patterns

### User Experience:

- [ ] Clear progress logging during generation
- [ ] Helpful error messages for debugging
- [ ] Audit failures prevent bad output
- [ ] Generated narratives need minimal editing

---

## 📊 Impact

### Before:

- ⏱️ **2-3 hours** manual work per report
- 🐛 Manual errors in scores/names
- 📝 Inconsistent narrative quality
- 🔄 Repetitive data entry
- 😴 No weekly previews (too time-consuming)

### After:

- ⏱️ **10 minutes** total (optional final review)
- ✅ Automated accuracy checks with **auto-correction** (audit-edit loop)
- 📝 Consistent Gemini-generated narratives (based on existing style)
- 🤖 Fully automated data pipeline
- ⚡ **NEW**: Weekly previews now feasible! (Thursday previews, Tuesday recaps)
- 💰 **Cost**: **$0.00** (free Gemini API tier)

**Time Saved**: ~2-3 hours per week → **~34-51 hours per season**  
**New Content**: 17 weekly previews that weren't previously generated  
**Cost Savings**: $0 vs $4.76/season with Claude (FREE with Gemini API)

---

## 🎯 What's Automated vs Manual

### Fully Automated ✅:

- Data fetching (matchups, rosters, players, users, projections)
- Team/owner name resolution
- **All narrative generation** (LLM-powered)
- Data validation and fact-checking
- JSON output generation
- Hall of Fame detection (top performances)
- Power ranking commentary
- Upcoming matchup previews
- League overview narratives

### Still Manual ❌ (Optional Overrides):

- Final narrative review (~10 min)
- Manual Hall of Fame entries (can override automated)
- Report page component creation (~5 min)
- Navigation link updates (~2 min)

### Architecture Choice: Single Agent + Audit-Edit Loop

- Using **single Google Gemini 1.5 Pro agent** with tool calls
- 25K token input fits in 2M context window (1.25% usage)
- **Free API tier** (vs $4.76/season for Claude)
- **Audit-edit loop**: Auto-regenerate failed sections (max 2× retries)
- Better coherence than multi-agent system
- See `WEB-REPORT-VISION.md` for detailed analysis
- See `WEB-REPORT-SECTIONS-DETAILED.md` for section-by-section data requirements

---

## 🔗 Dependencies

### Internal:

- `@/lib/sleeper/unified-client` - Sleeper API client
- `@gauntlet/types` - Type definitions
- Existing report structure (`data/report-week*.json`)
- Simulation engine (for win probabilities)

### External (Existing):

- Sleeper API (for data)
- Node.js fs/path (for file operations)

### New Dependencies:

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

### Environment Variables:

```bash
GOOGLE_API_KEY="AIza..."  # Free Gemini API key (Google AI Studio)
```

### Rate Limits (Free Tier):

- 15 requests per minute (RPM)
- 1M tokens per minute (TPM)
- 1,500 requests per day (RPD)
- **Our usage**: ~600K tokens/recap, ~180K tokens/preview (well within limits)

---

## 🧪 Testing Strategy

### Per Task:

Each task includes verification commands to test in isolation.

### Integration Test:

After completing all 4 tasks, run full pipeline:

```bash
# Generate Week 5 report
npm run generate-report 5

# Verify output
cat apps/web/data/report-week5-automated.json | jq '.audit'

# Should show:
# {
#   "totalMatchups": 12,
#   "passed": 12,
#   "failed": 0,
#   "totalErrors": 0,
#   "totalWarnings": 0
# }
```

---

## 📝 Follow-Up Work (Not in These Tasks)

After completing WEB-REPORT-004, you'll still need to:

1. **Review Generated Narratives** (10 min)
   - Read through matchup recaps
   - Make minor edits if needed
   - Ensure tone is consistent

2. **Write Hall of Fame Entries** (15 min)
   - Biggest blowout
   - Closest game
   - Top scorer
   - Biggest disappointment

3. **Create Report Page** (5 min)
   - Copy from previous week
   - Update week number
   - Paste in narratives

4. **Update Navigation** (2 min)
   - Add to reports list
   - Update competition page "Latest Report"

**Total Manual Work**: ~30 minutes (down from 2-3 hours!)

---

## 🎓 Learning Opportunities

This system demonstrates:

- **Pipeline architecture** (fetch → transform → validate → output)
- **Data validation** patterns (auditing against source of truth)
- **Error handling** strategies (fail fast, clear messages)
- **Type safety** at scale (comprehensive type definitions)
- **Separation of concerns** (each task handles one thing)

---

## 🚧 Known Limitations

### Current Scope:

1. **Human review optional**: Audit-edit loop handles most errors, manual review
   recommended but not required
2. **Single agent**: Sequential processing (~60-90s per report)
3. **Gemini-dependent**: Requires Google API access (free tier available)
4. **Manual page creation**: Report pages still need manual setup (5 min)
5. **Rate limits**: Free tier has 15 RPM limit (sufficient for our needs)

### Future Enhancements:

- Multi-agent system for parallel section generation (if needed)
- Historical context RAG (retrieve season-long storylines)
- Automated page component generation
- Custom tone controls (serious, humorous, analytical)
- A/B testing different narrative styles
- Image generation for key moments

---

## 🎉 Ready to Start?

1. **Read** this summary completely
2. **Start** with WEB-REPORT-001
3. **Test** each task thoroughly before moving on
4. **Update** PROGRESS.md as you complete tasks
5. **Commit** with task IDs in commit messages

Let's automate those reports! 🚀

---

## 📚 Documentation Files

- `WEB-REPORT-VISION.md` — **START HERE**: Comprehensive architecture design
- `WEB-REPORT-SECTIONS-DETAILED.md` — **SECTION BREAKDOWN**: Granular data
  requirements for all 20 sections
- `WEB-REPORT-SUMMARY.md` (this file) — Task breakdown & execution plan
- `WEB-REPORT-GROOMING-SUMMARY.md` — Grooming session notes & decisions made
- `WEB-REPORT-001-langgraph-foundation.md` — Data layer & orchestration setup
- `WEB-REPORT-002-llm-narratives.md` — Gemini-powered narrative generation
- `WEB-REPORT-003-fact-checking.md` — Validation & audit-edit loop
- `WEB-REPORT-004-cli-output.md` — CLI script & report output

---

## 🎓 Key Decisions Made (October 8, 2025)

1. **Single Agent Architecture**: 25K tokens fits in Gemini's 2M context, better
   coherence
2. **LangGraph Orchestration**: Proven framework for LLM tool calling
3. **Google Gemini 1.5 Pro**: Free API + 2M context + excellent quality
4. **Two Report Types**: Previews (Thursday) + Recaps (Tuesday)
5. **Audit-Edit Loop**: Auto-regenerate failed sections (max 2× retries)
6. **Sequential Processing**: Acceptable latency (~60-90s) for better coherence
7. **No Human-in-Loop**: Trust audit system, manual review optional
8. **Base on Existing Style**: Use Week 5 manual style as template

See `WEB-REPORT-VISION.md` for detailed rationale on each decision.

---

## 🎉 Ready to Start?

1. **Read** `WEB-REPORT-VISION.md` for full architecture
2. **Read** `WEB-REPORT-SECTIONS-DETAILED.md` for granular section breakdown (20
   recap sections, 6 preview sections)
3. **Set up** Google AI Studio API key (`GOOGLE_API_KEY`) —
   [Get free key here](https://aistudio.google.com/app/apikey)
4. **Install** new dependencies:
   `pnpm add @langchain/core @langchain/langgraph @langchain/google-genai @google/generative-ai`
5. **Start** with WEB-REPORT-001 (Data layer & LangGraph setup)
6. **Test** each phase with Week 5 data (compare to existing manual report)
7. **Deploy** for Week 6 onwards (Preview Thursday, Recap Tuesday)

Let's automate those reports with AI! 🤖✨

**Estimated Timeline**: 12-16 hours total, 4 sprints over 6 days
