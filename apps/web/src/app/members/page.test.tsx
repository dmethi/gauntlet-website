import { describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';
import MembersPage from './page';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

describe('MembersPage', () => {
  it('redirects the retired directory route to managers', async () => {
    await MembersPage();

    expect(redirect).toHaveBeenCalledWith('/managers');
  });
});
