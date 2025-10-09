# Weekly Recap Report Generation System

## Overview

This directory contains the LangGraph-based orchestration system for generating automated weekly recap reports using Google's Gemini AI.

## Current Status

### 📋 Phase 3 Progress

#### ✅ Completed
- **RECAP-018**: JSON Report Output
  - Report formatter (state → WeeklyRecapReport)
  - Comprehensive validation with quality scoring
  - Handles partial failures gracefully
  - Test suite with 100% passing tests

#### ⏳ In Progress
- **RECAP-019**: File System Storage
- **RECAP-020**: Dynamic Page Generation
- **RECAP-021**: Homepage Integration
- **RECAP-022**: CLI Tool
- **RECAP-023**: Cron Job Setup
- **RECAP-024**: Error Recovery System
- **RECAP-025**: Monitoring & Logging
- **RECAP-026**: Documentation & Deployment

### ✅ Completed (RECAP-001, RECAP-002)

- **LangGraph Orchestration**: State machine setup with proper workflow management
- **Gemini API Integration**: Client configuration with function calling capabilities
- **Environment Configuration**: Proper `.env` file loading from root directory
- **Test Infrastructure**: Validation scripts for both orchestrator and API

### ✅ API Key Configuration

The Gemini API key is configured in the root `.env` file and working correctly.

**Note**: If you have `GEMINI_API_KEY` exported in your shell environment (e.g., in `.bashrc` or `.zshrc`), it may conflict with the `.env` file. The test script explicitly clears shell environment variables to ensure the `.env` file is used.

## Project Structure

```
recap/
├── orchestrator.ts           # Main LangGraph state machine
├── state.ts                  # State type definitions
├── gemini-client.ts          # Gemini API client & configuration
├── test-function-calling.ts  # Function calling validation
├── nodes/
│   └── test-node.ts         # Test node (will be replaced)
├── tools/                    # Tool integration framework
│   ├── base.ts              # Tool interface & base types
│   ├── registry.ts          # Tool registry & executor
│   ├── errors.ts            # Error handling utilities
│   └── examples/
│       └── league-stats-tool.ts  # Example tool implementation
└── README.md                # This file
```

## Available Scripts

```bash
# Test the LangGraph orchestrator (no API calls)
pnpm run test:recap-orchestrator

# Test Gemini API integration (requires valid API key)
pnpm run test:gemini-api

# Test tool integration framework
pnpm run test:tool-framework
```

## Implementation Details

### Gemini API Configuration

- **Model**: `gemini-2.0-flash` (latest generation, fast, cost-effective)
- **Temperature**: `0.7` (balanced creativity)
- **Max Tokens**: `8192` (long narratives)
- **Context Window**: 2M tokens
- **Rate Limits**: 15 RPM, 1M TPM, 1.5K RPD (free tier)

### State Management

The `RecapReportState` interface tracks:

- Input parameters (week, season)
- Section outputs (12 sections total)
- Metadata (tokens used, errors, timestamp)

### Tool Integration Framework

A flexible system for Gemini to call TypeScript functions:

- **Tool Registry**: Central registration and execution system
- **Type-Safe**: Generic interfaces for args and results
- **Error Handling**: Graceful failures with execution tracking
- **Performance Metrics**: Execution time, success rate, history
- **Example Tool**: `fetch_league_stats` demonstrates the pattern

### Workflow Design

Current: `START → test_node → END`

Future: Will expand to include:

- League overview generation
- 12× matchup narratives
- Hall of Fame/Shame sections
- Power rankings
- Standings analysis
- Upcoming matchups preview
- Closing remarks

## Next Steps (Phase 2)

### RECAP-004: Prompt System Foundation

- Design prompt templates for each section
- Implement context building utilities
- Create few-shot examples for consistency

### RECAP-005: TypeScript Types & Schemas

- Define tool parameter schemas
- Create validation utilities
- Integrate with `@gauntlet/types`

## Code Quality Standards

All code follows the Gauntlet coding conventions:

- ✅ Arrow functions only (no classes)
- ✅ Factory pattern for stateful objects
- ✅ Type-safe with explicit return types
- ✅ Proper error handling
- ✅ ESLint compliant
- ✅ Imports from central `@gauntlet/types` package

## Testing Strategy

### Phase 1 (Current)

- [x] LangGraph orchestration works
- [x] Gemini client initializes correctly
- [x] Environment variables load properly
- [x] Function calling capability verified
- [x] Tool integration framework implemented
- [x] Tool registry with execution tracking
- [x] Error handling and performance metrics

### Phase 2 (Next)

- [ ] Data fetching tools tested
- [ ] Prompt templates validated
- [ ] Section generation smoke tests
- [ ] End-to-end report generation

## Tool Framework Usage

### Creating a New Tool

```typescript
// 1. Define your tool with typed args and result
import type { ReportTool } from '../tools/base';

interface MyToolArgs {
  week: number;
  teamId: string;
}

interface MyToolResult {
  score: number;
  rank: number;
}

export const myTool: ReportTool<MyToolArgs, MyToolResult> = {
  name: 'fetch_team_score',
  description: 'Fetches team score and rank for a given week',

  parameters: {
    type: 'object',
    properties: {
      week: { type: 'number', description: 'NFL week number' },
      teamId: { type: 'string', description: 'Team identifier' },
    },
    required: ['week', 'teamId'],
  },

  execute: async (args: MyToolArgs): Promise<MyToolResult> => {
    // Fetch real data from Sleeper API
    const data = await sleeperClient.fetchMatchups(leagueId, args.week);
    // Transform and return
    return { score: 125.5, rank: 3 };
  },
};

// 2. Register the tool
import { toolRegistry } from '../tools/registry';
toolRegistry.register(myTool);

// 3. Use in LangGraph nodes
const result = await toolRegistry.execute(
  'fetch_team_score',
  { week: 5, teamId: 'team_123' },
  { week: 5, season: 2025, debug: true },
);

if (result.success) {
  console.log('Team score:', result.data.score);
}
```

## Known Issues

1. **Test Node**: The current test node is a placeholder and will be replaced with real content generation nodes

## Resources

- [LangGraph Documentation](https://js.langchain.com/docs/langgraph)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Project Task List](../../../../../tasks/)
