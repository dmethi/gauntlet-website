import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ManagerSelector } from './ManagerSelector';

describe('ManagerSelector', () => {
  it('renders manager options', () => {
    const handleChange = vi.fn();
    render(
      <ManagerSelector
        options={[
          { value: 'a', label: 'Alpha', leagueLabel: 'Legion I' },
          { value: 'b', label: 'Beta', leagueLabel: 'Legion II' },
        ]}
        value="a"
        onChange={handleChange}
      />,
    );

    expect(screen.getByText('Alpha (Legion I)')).toBeInTheDocument();
    expect(screen.queryByText(/AFC|NFC/)).not.toBeInTheDocument();
  });
});
