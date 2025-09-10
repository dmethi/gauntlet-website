#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { ReportNotesInput, ReportWeekData } from '../../../../packages/lib/src/report/types';
import { renderReportMarkdown } from '../../../../packages/lib/src/report/template';
import { defaultIndexPath, retrieveSnippets } from '../../../../packages/lib/src/report/retrieval';

function loadJson<T>(p: string): T {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as T;
}

function maybeLoad<T>(p?: string): T | null {
  if (!p) return null;
  if (!fs.existsSync(p)) return null;
  return loadJson<T>(p);
}

async function main() {
  const notesPath = process.env.NOTES_JSON as string;
  const dataPath = process.env.DATA_JSON as string;
  if (!notesPath || !dataPath) {
    console.error('NOTES_JSON and DATA_JSON env vars are required');
    process.exit(1);
  }
  const notes = loadJson<ReportNotesInput>(notesPath);
  const data = loadJson<ReportWeekData>(dataPath);

  // Optional: fetch a few style snippets per section (style only; do not copy verbatim)
  const idxPath = defaultIndexPath();
  const style = {
    intro: retrieveSnippets(
      idxPath,
      { section: 'intro', topics: ['parity'], limit: 3 },
      notes.authorNotes?.coldOpen
    ),
    overview: retrieveSnippets(idxPath, { section: 'overview', topics: ['parity'] }, undefined),
    rankings: retrieveSnippets(idxPath, { section: 'rankings' }, undefined),
  };
  // We could pass style snippets into the renderer; for now we just render baseline.

  const md = renderReportMarkdown(data, notes.controls || {});
  process.stdout.write(md);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
