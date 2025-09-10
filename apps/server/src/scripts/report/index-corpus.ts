#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { CorpusChunk, CorpusIndex } from '../../../../packages/lib/src/report/types';

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}

function chunkReport(filePath: string): CorpusChunk[] {
  const text = fs.readFileSync(filePath, 'utf8');
  const sections: CorpusChunk[] = [];
  const lines = text.split(/\r?\n/);
  let buffer: string[] = [];
  let section: CorpusChunk['section'] = 'other';
  let seq = 0;

  const flush = () => {
    const chunkText = buffer.join('\n').trim();
    if (!chunkText) return;
    sections.push({
      id: `${path.basename(filePath)}::${seq++}`,
      file: path.basename(filePath),
      section,
      teamsMentioned: [],
      topics: [],
      text: chunkText,
      vector: [],
    });
    buffer = [];
  };

  for (const line of lines) {
    const l = line.trim();
    if (/^league overview/i.test(l)) {
      flush();
      section = 'overview';
    } else if (/^miscellaneous notes/i.test(l)) {
      flush();
      section = 'notes';
    } else if (/^power rank/i.test(l) || /panic level/i.test(l)) {
      flush();
      section = 'rankings';
    } else if (/matchup of the week/i.test(l)) {
      flush();
      section = 'matchup';
    }
    buffer.push(line);
  }
  flush();

  // naive team/topic extraction
  for (const c of sections) {
    const lower = c.text.toLowerCase();
    const topics: string[] = [];
    if (lower.includes('parity')) topics.push('parity');
    if (lower.includes('kicker')) topics.push('kicker');
    if (lower.includes('defense')) topics.push('defense');
    if (lower.includes('bench')) topics.push('bench');
    if (lower.includes('luck')) topics.push('luck');
    c.topics = topics;
  }

  return sections;
}

async function main() {
  const reportsDir = path.join(process.cwd(), 'past_reports');
  const outPath = path.join(reportsDir, 'vectors.json');
  const files = listMarkdownFiles(reportsDir);
  const chunks = files.flatMap(chunkReport);
  const index: CorpusIndex = { dim: 0, chunks };
  fs.writeFileSync(outPath, JSON.stringify(index, null, 2));
  process.stdout.write(`Indexed ${chunks.length} chunks -> ${outPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
