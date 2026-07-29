import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootNotFound from '../not-found';
import ReportNotFound from '../competition/reports/[season]/[slug]/not-found';

/**
 * The contract of a 404 boundary is that it offers a way back into the site.
 * These assert the recovery links, not the copy or markup.
 */

describe('root not-found boundary', () => {
  it('offers a link back to the competition landing page', () => {
    render(<RootNotFound />);

    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Competition/ })).toHaveAttribute(
      'href',
      '/competition',
    );
  });

  it('offers a link to the reports index', () => {
    render(<RootNotFound />);

    expect(screen.getByRole('link', { name: /Browse Weekly Reports/ })).toHaveAttribute(
      'href',
      '/competition/reports',
    );
  });
});

describe('recap report not-found boundary', () => {
  it('explains the missing recap and links back to the reports index', () => {
    render(<ReportNotFound />);

    expect(screen.getByRole('heading', { name: 'Report Not Found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View All Reports/ })).toHaveAttribute(
      'href',
      '/competition/reports',
    );
    expect(screen.getByRole('link', { name: /Return to Competition Page/ })).toHaveAttribute(
      'href',
      '/competition',
    );
  });
});
