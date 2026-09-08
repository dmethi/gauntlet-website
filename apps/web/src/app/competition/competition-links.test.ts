import { describe, expect, it } from 'vitest';
import {
  COMPETITION_EXPLORE_LINKS,
  REPORT_ARCHIVE_LINK,
  REPORT_HUB_LINKS,
  REPORT_HUB_SECTIONS,
} from './competition-links';

describe('competition navigation', () => {
  it('keeps previews, draft recap, and live scores inside the reports hub', () => {
    expect(REPORT_HUB_LINKS.map(link => link.href)).toEqual([
      '/competition/preview/2026/week-1',
      '/draft/analysis',
      '/matchups',
    ]);

    const exploreHrefs = COMPETITION_EXPLORE_LINKS.map(link => link.href);
    expect(exploreHrefs).toContain('/competition/reports');
    expect(exploreHrefs).not.toContain('/competition/preview/2026/week-1');
    expect(exploreHrefs).not.toContain('/draft/analysis');
    expect(exploreHrefs).not.toContain('/matchups');
    expect(exploreHrefs).not.toContain('/start-sit');
  });

  it('organizes current coverage by report type and links legacy reports through an archive', () => {
    expect(REPORT_HUB_SECTIONS.map(section => section.title)).toEqual([
      'Previews',
      'Recaps',
      'Live Coverage',
    ]);
    expect(REPORT_ARCHIVE_LINK).toMatchObject({
      href: '/competition/reports/archive/2025',
      label: '2025 Archive',
    });
  });
});
