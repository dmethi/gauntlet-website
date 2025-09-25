#!/usr/bin/env tsx

/**
 * AI Recap Generation Script
 *
 * Combines enhanced matchup context with AI prompting to generate matchup recaps
 * Usage: npx tsx scripts/generate-ai-recaps.ts --week=2 --matchupId=5 [--ai-service=openai]
 */

import fs from 'fs/promises';
import path from 'path';
import { ReportEnhancer, type EnhancedMatchup } from './enhance-report-with-context.js';

interface AIRecapOptions {
  service: 'openai' | 'claude' | 'local' | 'prompt-only';
  model?: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GeneratedRecap {
  matchupId: number;
  teamA: string;
  teamB: string;
  finalScore: string;
  recap: string;
  prompt: string;
  metadata: {
    generatedAt: string;
    aiService: string;
    model?: string;
    confidence: number;
    wordCount: number;
  };
}

class AIRecapGenerator {
  private options: AIRecapOptions;

  constructor(options: AIRecapOptions) {
    this.options = options;
  }

  async generateRecap(matchup: EnhancedMatchup): Promise<GeneratedRecap> {
    const prompt = this.buildPrompt(matchup);

    let recap: string;
    let model: string | undefined;

    switch (this.options.service) {
      case 'openai':
        ({ recap, model } = await this.callOpenAI(prompt));
        break;
      case 'claude':
        ({ recap, model } = await this.callClaude(prompt));
        break;
      case 'local':
        ({ recap, model } = await this.callLocalLLM(prompt));
        break;
      case 'prompt-only':
        recap = `[AI RECAP WOULD BE GENERATED HERE]\n\nPrompt used:\n${prompt}`;
        model = 'prompt-only';
        break;
      default:
        throw new Error(`Unsupported AI service: ${this.options.service}`);
    }

    return {
      matchupId: matchup.matchupId,
      teamA: matchup.teamAName,
      teamB: matchup.teamBName,
      finalScore: `${Math.max(matchup.pointsA, matchup.pointsB).toFixed(1)}-${Math.min(matchup.pointsA, matchup.pointsB).toFixed(1)}`,
      recap,
      prompt,
      metadata: {
        generatedAt: new Date().toISOString(),
        aiService: this.options.service,
        model,
        confidence: this.calculateRecapConfidence(matchup),
        wordCount: recap.split(/\s+/).length,
      },
    };
  }

  private buildPrompt(matchup: EnhancedMatchup): string {
    const winner = matchup.pointsA > matchup.pointsB ? matchup.teamAName : matchup.teamBName;
    const loser = matchup.pointsA > matchup.pointsB ? matchup.teamBName : matchup.teamAName;
    const winnerScore = Math.max(matchup.pointsA, matchup.pointsB);
    const loserScore = Math.min(matchup.pointsA, matchup.pointsB);

    return `You are a fantasy football expert writer who creates engaging, entertaining matchup recaps. Your writing style is:
- Knowledgeable yet accessible
- Entertaining with personality 
- Statistically informed but not dry
- Captures both the drama and the details
- Uses vivid language and storytelling techniques

Write an engaging matchup recap for this fantasy football game. Use the provided statistical context to craft a narrative that captures both the drama and the key storylines.

**MATCHUP**: ${matchup.teamAName} vs ${matchup.teamBName}
**FINAL SCORE**: ${winnerScore.toFixed(1)} - ${loserScore.toFixed(1)}
**WINNER**: ${winner}

## Statistical Context

### Game Flow
${matchup.aiContext.flow.gameNarrative}

**Key Moments:**
${matchup.aiContext.flow.keyMoments.map(moment => `- ${moment}`).join('\n')}

**Pace Analysis:** ${matchup.aiContext.flow.paceAnalysis}

**Momentum Shifts:**
${matchup.aiContext.flow.momentumShifts.map(shift => `- ${shift}`).join('\n')}

### Stakes & Context
${matchup.aiContext.stakes.contextSummary}

**Rivalry Level:** ${matchup.aiContext.stakes.rivalryLevel}
**Power Rankings:** ${matchup.aiContext.stakes.powerRankingContext}

**Season Implications:**
${matchup.aiContext.stakes.seasonImplications.map(imp => `- ${imp}`).join('\n')}

**Playoff Implications:**
${matchup.aiContext.stakes.playoffImplications.map(imp => `- ${imp}`).join('\n')}

### Team Performance Analysis

#### ${matchup.teamAName}
${matchup.aiContext.performance.teamAAnalysis.summaryVsExpectations}

**Key Performers:**
${matchup.aiContext.performance.teamAAnalysis.keyPerformers.map(perf => `- ${perf}`).join('\n')}

**Disappointments:**
${matchup.aiContext.performance.teamAAnalysis.disappointments.map(dis => `- ${dis}`).join('\n')}

**Positional Impact:** ${matchup.aiContext.performance.teamAAnalysis.positionalImpact}

#### ${matchup.teamBName}
${matchup.aiContext.performance.teamBAnalysis.summaryVsExpectations}

**Key Performers:**
${matchup.aiContext.performance.teamBAnalysis.keyPerformers.map(perf => `- ${perf}`).join('\n')}

**Disappointments:**
${matchup.aiContext.performance.teamBAnalysis.disappointments.map(dis => `- ${dis}`).join('\n')}

**Positional Impact:** ${matchup.aiContext.performance.teamBAnalysis.positionalImpact}

#### Head-to-Head Comparison
${matchup.aiContext.performance.headToHeadComparison.map(comp => `- ${comp}`).join('\n')}

### Statistical Superlatives

**Hall of Fame Worthy:**
${matchup.aiContext.superlatives.hallOfFameWorthy.map(hof => `- ${hof}`).join('\n')}

**Weekly Superlatives:**
${matchup.aiContext.superlatives.weeklySuperlatives.map(sup => `- ${sup}`).join('\n')}

**Unusual Stats:**
${matchup.aiContext.superlatives.unusualStats.map(stat => `- ${stat}`).join('\n')}

**Records Set:**
${matchup.aiContext.superlatives.recordsSet.map(record => `- ${record}`).join('\n')}

### Narrative Elements

**Primary Storyline:** ${matchup.aiContext.narrativeElements.primaryStoryline}

**Secondary Storylines:**
${matchup.aiContext.narrativeElements.secondaryStorylines.map(story => `- ${story}`).join('\n')}

**Quotable Stats:**
${matchup.aiContext.narrativeElements.quotableStats.map(stat => `- ${stat}`).join('\n')}

**Memory Makers:**
${matchup.aiContext.narrativeElements.memoryMakers.map(maker => `- ${maker}`).join('\n')}

---

## Instructions

Create a compelling 3-4 paragraph matchup recap that:

1. **Opens with drama** - Start with the most compelling angle (upset, thriller, blowout, record-setting performance, etc.)

2. **Tells the story** - Use the game flow data to narrate how the game unfolded, including key momentum shifts and turning points

3. **Highlights heroes and zeros** - Feature the standout performances and disappointments, with statistical context

4. **Provides broader context** - Connect this game to season-long narratives, playoff races, power rankings, and historical context

5. **Ends memorably** - Close with the lasting impact, what this means going forward, or a quotable statistical flourish

**Style Notes:**
- Use active voice and vivid descriptions
- Include specific statistics but weave them into the narrative naturally  
- Create personality through word choice and phrasing
- Balance entertainment with information
- Make it feel like you watched the games, not just read the stats

**Length:** 3-4 substantial paragraphs (300-500 words total)`;
  }

  private async callOpenAI(prompt: string): Promise<{ recap: string; model: string }> {
    // Placeholder for OpenAI integration
    if (!this.options.apiKey) {
      throw new Error(
        'OpenAI API key required. Set OPENAI_API_KEY environment variable or pass --api-key'
      );
    }

    // In a real implementation, you'd call OpenAI's API here
    console.log('🤖 Calling OpenAI API...');

    return {
      recap:
        '[OpenAI API integration not implemented yet. See prompt above for what would be sent.]',
      model: this.options.model || 'gpt-4',
    };
  }

  private async callClaude(prompt: string): Promise<{ recap: string; model: string }> {
    // Placeholder for Claude integration
    if (!this.options.apiKey) {
      throw new Error(
        'Anthropic API key required. Set ANTHROPIC_API_KEY environment variable or pass --api-key'
      );
    }

    console.log('🤖 Calling Claude API...');

    return {
      recap:
        '[Claude API integration not implemented yet. See prompt above for what would be sent.]',
      model: this.options.model || 'claude-3-sonnet',
    };
  }

  private async callLocalLLM(prompt: string): Promise<{ recap: string; model: string }> {
    // Placeholder for local LLM integration (Ollama, etc.)
    console.log('🤖 Calling local LLM...');

    return {
      recap:
        '[Local LLM integration not implemented yet. You could integrate with Ollama or other local solutions here.]',
      model: this.options.model || 'llama2',
    };
  }

  private calculateRecapConfidence(matchup: EnhancedMatchup): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on available context
    if (matchup.aiContext.flow.keyMoments.length > 0) confidence += 0.1;
    if (matchup.aiContext.stakes.seasonImplications.length > 0) confidence += 0.1;
    if (matchup.aiContext.performance.teamAAnalysis.keyPerformers.length > 0) confidence += 0.1;
    if (matchup.aiContext.performance.teamBAnalysis.keyPerformers.length > 0) confidence += 0.1;
    if (matchup.aiContext.superlatives.hallOfFameWorthy.length > 0) confidence += 0.1;
    if (matchup.aiContext.narrativeElements.quotableStats.length > 0) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const week = parseInt(args.find(arg => arg.startsWith('--week='))?.split('=')[1] || '0');
  const matchupId = parseInt(
    args.find(arg => arg.startsWith('--matchupId='))?.split('=')[1] || '0'
  );
  const aiService = (args.find(arg => arg.startsWith('--ai-service='))?.split('=')[1] ||
    'prompt-only') as AIRecapOptions['service'];
  const model = args.find(arg => arg.startsWith('--model='))?.split('=')[1];
  const apiKey =
    args.find(arg => arg.startsWith('--api-key='))?.split('=')[1] ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY;
  const input =
    args.find(arg => arg.startsWith('--input='))?.split('=')[1] ||
    `./enhanced-report-week-${week}.json`;
  const output =
    args.find(arg => arg.startsWith('--output='))?.split('=')[1] || `./ai-recaps-week-${week}.json`;

  if (!week) {
    console.error(
      'Usage: npx tsx scripts/generate-ai-recaps.ts --week=2 [--matchupId=5] [--ai-service=openai] [--model=gpt-4] [--api-key=...] [--input=...] [--output=...]'
    );
    console.error('');
    console.error('AI Services: openai, claude, local, prompt-only');
    console.error('If no matchupId specified, generates recaps for all matchups in the week');
    process.exit(1);
  }

  console.log(`🤖 Generating AI recaps for Week ${week}...`);
  console.log(`📖 AI Service: ${aiService}`);
  console.log(`📊 Input: ${input}`);
  console.log(`💾 Output: ${output}`);

  // Load enhanced report data
  let enhancedReport;
  try {
    const reportJson = await fs.readFile(input, 'utf-8');
    enhancedReport = JSON.parse(reportJson);
  } catch (error) {
    console.error(
      `❌ Could not load enhanced report from ${input}. Run enhance-report-with-context.ts first.`
    );
    console.error(`   Example: npx tsx scripts/enhance-report-with-context.ts --week=${week}`);
    process.exit(1);
  }

  const generator = new AIRecapGenerator({
    service: aiService,
    model,
    apiKey,
    maxTokens: 1000,
    temperature: 0.7,
  });

  const allRecaps: GeneratedRecap[] = [];

  for (const league of enhancedReport.leagues) {
    console.log(`\n🏈 Processing ${league.leagueName}...`);

    const matchupsToProcess = matchupId
      ? league.matchups.filter((m: any) => m.matchupId === matchupId)
      : league.matchups;

    if (matchupId && matchupsToProcess.length === 0) {
      console.warn(`   ⚠️  Matchup ${matchupId} not found in ${league.leagueName}`);
      continue;
    }

    for (const matchup of matchupsToProcess) {
      console.log(`   📝 Generating recap: ${matchup.teamAName} vs ${matchup.teamBName}`);

      try {
        const recap = await generator.generateRecap(matchup);
        allRecaps.push(recap);

        console.log(
          `   ✅ Generated (${recap.metadata.wordCount} words, ${(recap.metadata.confidence * 100).toFixed(1)}% confidence)`
        );

        if (aiService === 'prompt-only') {
          console.log(`   📋 Prompt ready for manual AI processing`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to generate recap for matchup ${matchup.matchupId}:`, error);
      }
    }
  }

  // Save all recaps
  const recapReport = {
    week,
    season: enhancedReport.season,
    generatedAt: new Date().toISOString(),
    aiService,
    model,
    totalRecaps: allRecaps.length,
    averageWordCount: Math.round(
      allRecaps.reduce((sum, recap) => sum + recap.metadata.wordCount, 0) / allRecaps.length
    ),
    averageConfidence:
      allRecaps.reduce((sum, recap) => sum + recap.metadata.confidence, 0) / allRecaps.length,
    recaps: allRecaps,
  };

  await fs.writeFile(output, JSON.stringify(recapReport, null, 2));

  console.log(`\n✅ Generated ${allRecaps.length} AI recaps: ${output}`);
  console.log(
    `📊 Average: ${recapReport.averageWordCount} words, ${(recapReport.averageConfidence * 100).toFixed(1)}% confidence`
  );

  if (aiService === 'prompt-only') {
    console.log(
      `\n📋 Prompts generated! Copy the prompts from the output file and paste them into your preferred AI chat interface.`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AIRecapGenerator, type GeneratedRecap, type AIRecapOptions };
