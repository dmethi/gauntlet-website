import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage from './page';

/**
 * The notice's contract is its content, not its markup — these assert every
 * required section from the design discussion (Option A: controller/audience,
 * data collected, purposes, processors, retention, contact, deletion/export)
 * is present as a heading, plus the contact address the section resolves to.
 */
describe('PrivacyPage', () => {
  it('renders the page title', () => {
    render(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: 'Privacy Notice' })).toBeInTheDocument();
  });

  it.each([
    'Who operates this site',
    'What we collect',
    'Why we collect it',
    'Who we share it with',
    'How long we keep it',
    'Your choices',
    'Requesting a copy or deletion of your data',
    'Contact',
    'Scope of this notice',
  ])('renders the "%s" section', title => {
    render(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('publishes the resolved contact address as a mailto link', () => {
    render(<PrivacyPage />);

    const link = screen.getByRole('link', { name: 'dmethi@gmail.com' });
    expect(link).toHaveAttribute('href', 'mailto:dmethi@gmail.com');
  });

  it('discloses every field the forms in prisma/schema.prisma persist', () => {
    render(<PrivacyPage />);

    // ReturnConfirmation: name, email, team
    // WaitlistEntry: name, email, referredBy, notes
    // Proposal: name, email, title, description, category
    expect(screen.getByText(/the team name you play under/)).toBeInTheDocument();
    expect(screen.getByText(/who referred you and any notes you add/)).toBeInTheDocument();
    expect(
      screen.getByText(/a title, a description, and, optionally, a category/),
    ).toBeInTheDocument();
  });

  it('states the resolved retention practice', () => {
    render(<PrivacyPage />);

    expect(screen.getByText(/kept for as long as the league operates/)).toBeInTheDocument();
    expect(
      screen.getByText(/delete your record, we will do so within 30 days/),
    ).toBeInTheDocument();
  });

  it('states the notice is a disclosure, not a compliance instrument', () => {
    render(<PrivacyPage />);

    expect(
      screen.getByText(/not a GDPR, CCPA, or other jurisdiction-specific compliance instrument/),
    ).toBeInTheDocument();
  });
});
