# WEB-REPORT Grooming Session Summary

**Date**: October 8, 2025  
**Session**: Vision & Task Restructuring  
**Duration**: ~1 hour

---

## 🎯 What We Accomplished

### 1. Elevated Vision from Template-Based to LLM-Powered

**Before**: Simple template-based system with basic string interpolation  
**After**: Full LangGraph orchestration with Claude 3.5 Sonnet for narrative
generation

**Key Improvements**:

- 📈 **2 report types**: Weekly Previews (new!) + Weekly Recaps
- 🤖 **LLM-powered narratives**: No more templates, actual intelligent writing
- 🔍 **Comprehensive auditing**: Fact-checking to prevent hallucinations
- 💰 **Cost-effective**: ~$0.17/recap, ~$0.11/preview (~$4.76/season)
- ⏱️ **Time savings**: 2-3 hours → 10 minutes per report

---

## 📝 Documents Created

### 1. `WEB-REPORT-VISION.md` (Comprehensive Architecture)

**Sections**:

- Executive summary
- **Data requirements** for both report types (18K tokens preview, 24K recap)
- **Architecture decision**: Single agent vs multi-agent (chose single agent)
- System components (5 layers)
- Data schemas & TypeScript types
- Testing & validation strategy
- Success metrics
- Implementation roadmap (4 phases, 12-16 hours)
- Cost analysis (~$4.76/season)
- Migration strategy
- Technical stack
- Open questions

**Key Decision**: Single-agent architecture with tool calls

- **Rationale**: 24K tokens fits in Claude's 200K context, better coherence
- **Alternative considered**: Multi-agent (rejected due to complexity + cost)

---

### 2. `WEB-REPORT-SUMMARY.md` (Updated)

**Changes**:

- ✅ Updated goal to reflect LLM-powered system
- ✅ Restructured 4 tasks for LangGraph approach
- ✅ Updated time estimates (5.5h → 12-16h)
- ✅ Added new dependencies (LangGraph, Anthropic SDK)
- ✅ Updated impact metrics (30 min → 10 min, added previews)
- ✅ Clarified what's automated vs manual
- ✅ Added architecture justification
- ✅ Updated execution plan for 4 sprints
- ✅ Added environment variable requirements

**Task Restructuring**: | Old Task | New Task | Time |
|----------|----------|------| | WEB-REPORT-001: Foundation (1.5h) |
WEB-REPORT-001: Data Layer & LangGraph Setup (4-5h) | +3h | | WEB-REPORT-002:
Narrative Gen (2h) | WEB-REPORT-002: LLM-Powered Narratives (4-5h) | +3h | |
WEB-REPORT-003: Auditing (1h) | WEB-REPORT-003: Fact-Checking (2-3h) | +2h | |
WEB-REPORT-004: Orchestration (1h) | WEB-REPORT-004: CLI & Output (2-3h) | +2h |
| **Total**: 5.5h | **Total**: 12-16h | +10h |

**Why the time increase?**

- LangGraph setup & learning curve
- Prompt engineering & iteration
- Claude API integration
- Comprehensive fact-checking system
- Quality validation against existing reports

---

## 🏗️ Architecture Decisions Made

### 1. Single Agent vs Multi-Agent

**Decision**: Single agent with tool calls  
**Rationale**:

- ✅ 24K tokens << 200K Claude context (plenty of room)
- ✅ Better narrative coherence (same voice/style)
- ✅ Simpler debugging (single trace)
- ✅ Lower cost (one conversation vs many)
- ✅ Acceptable latency (~60-90s per report)

**When would we use multi-agent?**

- If reports grow to 100K+ tokens
- If we need parallel section generation for speed
- If different sections need specialized models

---

### 2. Report Types

**Type 1: Weekly Previews** (NEW!)

- Pre-game analysis
- Projected scores & win probabilities
- Storylines & rivalries
- Must-watch games
- Injury reports
- ~18K tokens input, ~3K words output

**Type 2: Weekly Recaps** (ENHANCED)

- Post-game analysis
- Matchup narratives (12 games)
- Hall of Fame / Hall of Shame
- Power rankings commentary
- Playoff picture analysis
- ~24K tokens input, ~5K words output

---

### 3. LangGraph Tool Architecture

**Data Tools**:

- `fetch_league_data` → Standings, rosters, matchups
- `fetch_matchup_details` → Box scores, player stats
- `fetch_projections` → Upcoming predictions
- `fetch_simulations` → Win probabilities
- `fetch_historical_context` → H2H records, trends
- `fetch_power_rankings` → Pre/post-week rankings

**Narrative Tools**:

- `generate_league_overview` → Main intro
- `generate_matchup_narrative` → Per-game recaps
- `generate_hall_of_fame` → Top performances
- `generate_power_rankings_commentary` → Ranking analysis
- `generate_closing_commentary` → Meta-analysis

**Audit Tools**:

- `validate_scores` → Check all scores match data
- `validate_player_names` → Verify roster membership
- `validate_records` → Check team records accurate
- `detect_contradictions` → Cross-section consistency
- `detect_hallucinations` → Flag uncertain language

---

### 4. Orchestration Flow

```
START
  ↓
FETCH_DATA (parallel data tools)
  ↓
VALIDATE_DATA (completeness checks)
  ↓
GENERATE_SECTION_1 (League Overview)
  ↓
GENERATE_SECTION_2 (Matchup 1)
  ↓
... (10 more matchups)
  ↓
GENERATE_SECTION_13 (Hall of Fame)
  ↓
GENERATE_SECTION_14 (Power Rankings)
  ↓
GENERATE_SECTION_15 (Closing)
  ↓
AUDIT_NARRATIVES (fact-check all sections)
  ↓
ASSEMBLE_REPORT (combine to JSON)
  ↓
OUTPUT_JSON (write to file)
  ↓
END
```

**Error Handling**: At each step, catch errors and provide graceful fallback

---

## 📋 Implementation Phases

### Phase 1: Foundation (4-5 hours)

**Goal**: Data layer + basic orchestration

**Deliverables**:

- LangGraph project structure
- Data fetcher tools (Sleeper API wrappers)
- TypeScript schemas (Report, Section, Metadata)
- Basic graph (fetch → assemble)
- Test with Week 5 data

**Files**:

- `lib/reports/data/` (fetchers)
- `lib/reports/schemas.ts` (types)
- `lib/reports/orchestrator.ts` (graph)
- `lib/reports/tools/data-tools.ts` (tools)

---

### Phase 2: LLM Narratives (4-5 hours)

**Goal**: Claude-powered narrative writing

**Deliverables**:

- System prompts (voice, style, constraints)
- Section-specific prompt templates
- Narrative generation tools
- Week 5 test output
- Quality comparison with manual baseline

**Files**:

- `lib/reports/prompts/system.ts` (system prompt)
- `lib/reports/prompts/sections/` (per-section)
- `lib/reports/tools/narrative-tools.ts` (tools)
- `tests/week5-comparison.test.ts` (quality)

---

### Phase 3: Fact-Checking (2-3 hours)

**Goal**: Prevent hallucinations

**Deliverables**:

- Audit functions (score, name, record validation)
- Audit tool for LangGraph
- Audit report generation
- Test with good/bad narratives
- Integration into graph

**Files**:

- `lib/reports/tools/audit-tools.ts` (tools)
- `lib/reports/auditor.ts` (logic)
- `tests/audit.test.ts` (tests)

---

### Phase 4: CLI & Output (2-3 hours)

**Goal**: User-friendly script

**Deliverables**:

- CLI script with args: `npm run generate-report <week> <type>`
- JSON output formatters
- Progress logging (LangGraph streaming)
- Error handling & recovery
- Usage documentation

**Files**:

- `scripts/generate-report.ts` (CLI)
- `lib/reports/output.ts` (formatters)
- `package.json` (npm script)
- `README.md` (docs)

---

## 🎓 Key Technical Decisions

### 1. TypeScript-First Approach

- All code in TypeScript (matches existing codebase)
- Leverage `@gauntlet/types` for domain types
- Arrow function syntax (per CODING_CONVENTIONS.MD)
- Comprehensive JSDoc on exports

### 2. Claude 3.5 Sonnet Choice

- **Best quality/cost ratio**: $0.003/1K input, $0.015/1K output
- **Large context**: 200K tokens (way more than we need)
- **Tool calling**: Native support for function calls
- **Streaming**: Can show progress during generation

**Alternatives considered**:

- GPT-4 Turbo: More expensive, similar quality
- Claude 3 Opus: Overkill for this task, 3x more expensive
- GPT-3.5: Cheaper but lower quality narratives

### 3. LangGraph vs Raw SDK

- **LangGraph chosen** for orchestration
- Built-in state management
- Checkpointing & resumability
- Streaming support
- Better error handling

**Alternatives considered**:

- Raw Anthropic SDK: Would need to build orchestration ourselves
- LangChain: Too heavyweight, LangGraph is lighter

### 4. Testing Strategy

- **Unit tests**: Each data fetcher, audit function
- **Integration test**: Full pipeline with Week 5
- **Quality baseline**: Compare automated vs manual Week 5
- **Manual review**: First 3-5 weeks require human approval

---

## 💰 Cost Analysis

### Per-Report Costs

**Preview Report**:

- Input: 18K tokens @ $0.003/1K = $0.054
- Output: ~4K tokens @ $0.015/1K = $0.060
- **Total: ~$0.11 per preview**

**Recap Report**:

- Input: 24K tokens @ $0.003/1K = $0.072
- Output: ~6.5K tokens @ $0.015/1K = $0.098
- **Total: ~$0.17 per recap**

**Season Cost** (17 weeks):

- 17 previews @ $0.11 = $1.87
- 17 recaps @ $0.17 = $2.89
- **Total: $4.76 per season**

**ROI**:

- Time saved: ~34-51 hours per season
- Cost: $4.76 per season
- **Value: $4.76 for 40+ hours = $0.12/hour** (🤯 incredible value!)

---

## 🚀 Next Steps

### Immediate (Before Starting Implementation)

1. **Review vision doc** with stakeholders
   - Approve single-agent architecture
   - Approve cost ($4.76/season)
   - Approve time estimate (12-16 hours)

2. **Answer open questions**:
   - ❓ Should we generate previews starting Week 6?
   - ❓ Do we want user-editable sections (e.g., manual Hall of Fame override)?
   - ❓ Should audit failures block publication? (Recommend: yes)
   - ❓ Need human-in-the-loop approval for first 3-5 weeks? (Recommend: yes)
   - ❓ Support custom narrative styles (serious vs humorous)? (Recommend:
     defer)

3. **Set up environment**:

   ```bash
   # Install dependencies
   pnpm add @langchain/core @langchain/langgraph @anthropic-ai/sdk

   # Set up API key
   export ANTHROPIC_API_KEY="sk-ant-..."

   # Verify access
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```

---

### Implementation (Sprint Schedule)

**Sprint 1** (Days 1-2): WEB-REPORT-001

- Set up LangGraph project
- Build data fetchers
- Define schemas
- Test with Week 5

**Sprint 2** (Days 3-4): WEB-REPORT-002

- Design Claude prompts
- Build narrative tools
- Generate Week 5 test output
- Compare quality

**Sprint 3** (Day 5): WEB-REPORT-003

- Build audit system
- Test fact-checking
- Integrate into graph

**Sprint 4** (Day 6): WEB-REPORT-004

- Build CLI
- Test full pipeline
- Generate Week 6 report
- Document usage

---

### Migration Strategy

**Week 6**: Proof of concept

- Generate recap with new system
- Compare to manual (if we had done one)
- Review quality, iterate on prompts

**Week 7**: Parallel run

- Generate automated recap
- Manually edit as needed
- Track edit time & quality

**Week 8**: Automated recap launch

- Ship automated recap with minimal edits
- Start generating previews too

**Week 9+**: Fully automated

- Both previews & recaps automated
- ~10 min manual review per week

---

## 📊 Success Metrics

### Must Have (MVP)

- [ ] 100% factual accuracy (no hallucinated scores/names)
- [ ] Zero audit failures on production runs
- [ ] < 90 seconds total generation time
- [ ] < $0.50 cost per report
- [ ] < 10 minutes human review time

### Should Have (V1)

- [ ] Engaging prose (subjective, human review)
- [ ] Consistent voice across sections
- [ ] 200-300 words per matchup recap
- [ ] Graceful degradation (fallback to manual on failure)

### Nice to Have (V2+)

- [ ] Custom tone controls
- [ ] Historical context RAG
- [ ] Automated Hall of Fame detection
- [ ] Automated page component generation

---

## 🎓 Lessons Learned (Pre-Implementation)

### What We Did Right

1. **Data-first approach**: Mapped token requirements before choosing
   architecture
2. **Cost analysis upfront**: Knew budget constraints before committing
3. **Baseline for comparison**: Week 5 manual report as quality benchmark
4. **Architectural options**: Considered multi-agent, chose single-agent with
   justification

### What to Watch Out For

1. **Prompt engineering time**: May take longer than expected to get quality
   right
2. **Audit system scope**: Could be complex, watch for scope creep
3. **LangGraph learning curve**: First time using this framework
4. **Quality expectations**: Manual reports are high-quality, need to match them

---

## 📚 Reference Documents

- `WEB-REPORT-VISION.md` — Architecture & design decisions
- `WEB-REPORT-SUMMARY.md` — Task breakdown & execution plan
- `WEB-REPORT-GROOMING-SUMMARY.md` (this file) — Grooming session summary

**Next to create** (during implementation):

- `WEB-REPORT-001-langgraph-foundation.md`
- `WEB-REPORT-002-llm-narratives.md`
- `WEB-REPORT-003-fact-checking.md`
- `WEB-REPORT-004-cli-output.md`

---

## 🎉 Ready to Build!

We've completed the vision & grooming phase. Next step: **get stakeholder
approval** and then dive into WEB-REPORT-001.

The vision is clear, the architecture is sound, and the path forward is
well-defined. Let's build an AI-powered report generation system that saves 40+
hours per season for less than $5! 🚀

---

**Last Updated**: October 8, 2025  
**Status**: ✅ Grooming Complete → Awaiting Stakeholder Approval
