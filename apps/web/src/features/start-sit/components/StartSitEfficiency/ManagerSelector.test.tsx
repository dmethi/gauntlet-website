import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ManagerSelector } from './ManagerSelector';

describe('ManagerSelector', () => {
  it('renders manager options', () => {
    const handleChange = vi.fn();
    render(
      <ManagerSelector
        options={[
          { value: 'a', label: 'Alpha', leagueLabel: 'AFC' },
          { value: 'b', label: 'Beta', leagueLabel: 'NFC' },
        ]}
        value="a"
        onChange={handleChange}
      />,
    );

    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
  });
});
