import fs from 'node:fs';
import path from 'node:path';
import { CorpusIndex, RetrievedSnippet, RetrievalCriteria } from './types';

function loadIndex(indexPath: string): CorpusIndex | null {
  if (!fs.existsSync(indexPath)) return null;
  const raw = fs.readFileSync(indexPath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as CorpusIndex;
    return parsed;
  } catch {
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

// Extremely tiny TF-IDF-ish vectorizer for fallback if vectors are missing.
function textToVector(text: string, vocab: Map<string, number>): number[] {
  const vec = new Array(vocab.size).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (const t of tokens) {
    const idx = vocab.get(t);
    if (idx != null) vec[idx] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

export function retrieveSnippets(
  indexPath: string,
  criteria: RetrievalCriteria,
  queryText?: string
): RetrievedSnippet[] {
  const index = loadIndex(indexPath);
  if (!index || index.chunks.length === 0) return [];

  // Build a simple vocab if needed
  const needsLocalVectors = index.chunks.some(c => !c.vector || c.vector.length === 0);
  let vocab: Map<string, number> | null = null;
  if (needsLocalVectors) {
    vocab = new Map();
    let cursor = 0;
    for (const c of index.chunks) {
      const tokens = c.text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      for (const t of tokens) {
        if (!vocab.has(t)) vocab.set(t, cursor++);
      }
    }
  }

  // Create query vector
  let qv: number[] = [];
  if (queryText) {
    if (needsLocalVectors && vocab) qv = textToVector(queryText, vocab);
    else qv = new Array(index.dim).fill(0); // unknown vector → zero vector (will score 0)
  }

  const section = criteria.section;
  const teams = new Set((criteria.teams || []).map(t => t.toLowerCase()));
  const topics = new Set((criteria.topics || []).map(t => t.toLowerCase()));

  const candidates = index.chunks.filter(c => c.section === section);
  const scored = candidates.map(c => {
    const teamOverlap = (c.teamsMentioned || []).some(t => teams.has((t || '').toLowerCase()));
    const topicOverlap = (c.topics || []).some(t => topics.has((t || '').toLowerCase()));

    let sim = 0;
    if (queryText) {
      if (needsLocalVectors && vocab) sim = cosineSimilarity(textToVector(c.text, vocab), qv);
      else sim = cosineSimilarity(c.vector || [], qv);
    }

    // Simple scoring: keyword overlaps + vector sim
    const overlapScore = (teamOverlap ? 0.2 : 0) + (topicOverlap ? 0.2 : 0);
    const score = overlapScore + sim;
    return { id: c.id, text: c.text, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const limit = Math.max(1, Math.min(criteria.limit || 5, 10));
  return scored.slice(0, limit);
}

export function defaultIndexPath(): string {
  return path.join(process.cwd(), 'past_reports', 'vectors.json');
}
