'use client';

import Link from 'next/link';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const AccountControls = () => {
  if (!clerkConfigured) return null;

  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal" fallbackRedirectUrl="/members">
          <button
            type="button"
            className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/members"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Members
        </Link>
        <UserButton userProfileUrl="/profile" />
      </Show>
    </div>
  );
};
