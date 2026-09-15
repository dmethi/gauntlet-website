import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GradeTxn, TeamInfo } from '../types';
import { ManagerRankings } from './ManagerRankings';

vi.mock('./ManagerDetailModal', () => ({
  ManagerDetailModal: ({ manager }: { manager: { teamName: string } }) => (
    <div role="dialog">Details for {manager.teamName}</div>
  ),
}));

const teams = new Map<string, TeamInfo>([
  [
    'alpha',
    {
      rosterId: 1,
      teamName: 'Alpha Managers',
      ownerName: 'Alex',
      leagueId: 'league-1',
      leagueName: 'Premier',
    },
  ],
]);

const transactions: GradeTxn[] = [
  {
    id: 'txn-1',
    type: 'waiver',
    createdAt: '2026-09-01',
    teamName: 'Alpha Managers',
    players: [],
    score: 4.2,
    grade: 'A',
  },
];

describe('ManagerRankings accessibility', () => {
  it('provides a named keyboard-scrollable rankings region', () => {
    render(<ManagerRankings transactions={transactions} allTeams={teams} />);

    expect(screen.getByRole('region', { name: 'Manager rankings table' })).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('opens manager details through a native keyboard-accessible control', async () => {
    const user = userEvent.setup();
    render(<ManagerRankings transactions={transactions} allTeams={teams} />);

    const managerButton = screen.getByRole('button', { name: 'View Alpha Managers details' });
    managerButton.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog')).toHaveTextContent('Details for Alpha Managers');
  });
});
