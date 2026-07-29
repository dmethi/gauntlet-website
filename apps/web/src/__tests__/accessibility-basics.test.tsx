import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClientLayout from '../components/client-layout';

/**
 * The shared shell's skip link is the recovery path for keyboard and screen
 * reader users on every shelled route: it must exist, target the actual
 * `<main>` landmark, and be reachable by focus before any other control. This
 * only asserts the observable contract (href matches landmark id, link is
 * focusable) rather than markup or copy.
 *
 * `@gauntlet/ui`'s real `AppNav` calls `usePathname()` from its own compiled
 * bundle, which Vitest externalizes for a workspace package and therefore
 * does not route through the `next/navigation` mock in `src/test/setup.ts`.
 * Stubbing `AppNav` keeps this test about the shell's skip-link contract,
 * not the nav package's SSR-mocking quirk.
 */
vi.mock('@gauntlet/ui', () => ({
  AppNav: () => <nav aria-label="Main navigation">stub nav</nav>,
}));

describe('accessibility: skip link and main landmark', () => {
  it('renders a skip link whose href targets the main landmark', () => {
    render(
      <ClientLayout>
        <p>Page content</p>
      </ClientLayout>,
    );

    const main = screen.getByRole('main');
    const mainId = main.getAttribute('id');
    expect(mainId).toBeTruthy();

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute('href', `#${mainId}`);
  });

  it('the skip link is focusable', () => {
    render(
      <ClientLayout>
        <p>Page content</p>
      </ClientLayout>,
    );

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    skipLink.focus();
    expect(skipLink).toHaveFocus();
  });
});
