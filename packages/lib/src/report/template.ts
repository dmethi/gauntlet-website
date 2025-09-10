import { ReportControls, ReportWeekData } from './types';

const EMOJI = {
  low: '🤙',
};

export function renderReportMarkdown(
  data: ReportWeekData,
  options: Partial<ReportControls> = {}
): string {
  const controls: ReportControls = {
    spiceLevel: options.spiceLevel ?? 2,
    memeDensity: options.memeDensity ?? 'low',
    emojiDensity: options.emojiDensity ?? 'low',
  };

  const lines: string[] = [];

  // Cold open placeholder; caller can prepend custom text.
  lines.push('This week was a roller coaster. Parity, chaos, and some prime-time meltdowns.');
  lines.push('');

  // Pick matchup of the week if available
  const byId = new Map(data.matchups.map(m => [m.matchupId, m] as const));
  const motw = data.features?.matchupOfTheWeek ? byId.get(data.features.matchupOfTheWeek) : null;
  if (motw) {
    lines.push('🚨 Matchup of the Week 🚨');
    lines.push(
      `${motw.teamAName} (${motw.scoreA.toFixed(2)}) vs ${motw.teamBName} (${motw.scoreB.toFixed(
        2
      )})`
    );
    lines.push('');
  }

  // All matchups
  for (const m of data.matchups) {
    const name = `${m.teamAName} (${m.scoreA.toFixed(2)}) vs ${m.teamBName} (${m.scoreB.toFixed(2)})`;
    lines.push(name);
    lines.push(
      `Margin: ${m.margin.toFixed(2)}${
        m.decidingFactors && m.decidingFactors.length ? ` • Key: ${m.decidingFactors[0]}` : ''
      }`
    );
    lines.push('');
    lines.push('Miscellaneous Notes');
    if (m.topPerformers?.length) lines.push(`- Top: ${m.topPerformers.join(', ')}`);
    if (m.duds?.length) lines.push(`- Duds: ${m.duds.join(', ')}`);
    if (m.startSitNotes?.length) lines.push(`- Start/Sit: ${m.startSitNotes.join('; ')}`);
    lines.push('');
  }

  // League overview
  lines.push('League Overview');
  if (data.features?.parityClusters?.length) {
    lines.push('- Parity clusters:');
    for (const c of data.features.parityClusters) {
      lines.push(`  - ${c.label}: ${c.teamIds.length} teams`);
    }
  }
  lines.push('');

  // Divisional/Power + Panic mock (sorted by total points)
  const sortedTeams = [...data.teams].sort((a, b) => b.totalPoints - a.totalPoints);
  lines.push('Power Rank | Panic Level');
  sortedTeams.forEach((t, idx) => {
    const panic = Math.min(
      10,
      Math.max(0, Math.round(10 - (t.wins / Math.max(1, t.wins + t.losses)) * 10))
    );
    lines.push(`${idx + 1}. ${t.name} — Panic: ${panic}/10`);
  });
  lines.push('');

  if (controls.emojiDensity !== 'none') lines.push(EMOJI.low);

  return lines.join('\n');
}
