import { redirect } from 'next/navigation';
import { PageHeaderHero } from '@gauntlet/ui';
import { ProfileForm } from '@/features/profiles/components/profile-form';
import { profileRepository } from '@/features/profiles/repository';
import { getProfileTeamOptions, profileIdentityKey } from '@/features/profiles/team-options';
import { requireUserId } from '@/lib/auth/require-user';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  searchParams: Promise<{ saved?: string }>;
}

const ProfilePage = async ({ searchParams }: ProfilePageProps) => {
  const userId = await requireUserId();
  const profile = await profileRepository.findByClerkUserId(userId);
  if (!profile) redirect('/onboarding');

  const [teamOptions, query] = await Promise.all([getProfileTeamOptions(), searchParams]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeaderHero
        title="Your profile"
        subtitle="Keep your directory details current without changing your Sleeper account."
        crestSrc="/gauntlet_logo.svg"
      />
      <div className="px-2 py-10 sm:px-6">
        {query.saved === '1' && (
          <p
            className="mb-8 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
            role="status"
          >
            Profile saved. Your directory card is up to date.
          </p>
        )}
        <ProfileForm
          mode="edit"
          teamOptions={teamOptions}
          defaults={{
            identityKey: profileIdentityKey(
              profile.leagueId,
              profile.rosterId,
              profile.sleeperUserId,
            ),
            fullName: profile.fullName,
            jobTitle: profile.jobTitle ?? '',
            city: profile.city ?? '',
            favoriteNflTeam: profile.favoriteNflTeam ?? '',
            favoritePlayer: profile.favoritePlayer ?? '',
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
