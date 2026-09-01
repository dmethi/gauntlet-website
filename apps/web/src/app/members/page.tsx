import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeaderHero } from '@gauntlet/ui';
import { MemberDirectory } from '@/features/profiles/components/member-directory';
import { getMemberDirectory } from '@/features/profiles/directory';
import { profileRepository } from '@/features/profiles/repository';
import { requireUserId } from '@/lib/auth/require-user';

export const dynamic = 'force-dynamic';

const MembersPage = async () => {
  const userId = await requireUserId();
  const profile = await profileRepository.findByClerkUserId(userId);
  if (!profile) redirect('/onboarding');

  const members = await getMemberDirectory();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeaderHero
        title="Member directory"
        subtitle={`${members.length} ${members.length === 1 ? 'person' : 'people'} behind the teams`}
        crestSrc="/gauntlet_logo.svg"
      />
      <div className="px-2 py-10 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">
              The people behind the rosters
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Use the directory to find common ground before the next matchup starts.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Edit your profile
          </Link>
        </div>
        <MemberDirectory members={members} />
      </div>
    </div>
  );
};

export default MembersPage;
