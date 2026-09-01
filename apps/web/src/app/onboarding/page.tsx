import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageHeaderHero } from '@gauntlet/ui';
import { ProfileForm } from '@/features/profiles/components/profile-form';
import { profileRepository } from '@/features/profiles/repository';
import { getProfileTeamOptions } from '@/features/profiles/team-options';
import { requireUserId } from '@/lib/auth/require-user';

export const dynamic = 'force-dynamic';

const OnboardingPage = async () => {
  const userId = await requireUserId();
  const existingProfile = await profileRepository.findByClerkUserId(userId);
  if (existingProfile) redirect('/profile');

  const [teamOptions, user] = await Promise.all([getProfileTeamOptions(), currentUser()]);
  const clerkName = user?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeaderHero
        title="Enter the directory"
        subtitle="Connect your Sleeper seat, then add the details that make an introduction easy."
        crestSrc="/gauntlet_logo.svg"
      />
      <div className="px-2 py-10 sm:px-6">
        <ProfileForm
          mode="create"
          teamOptions={teamOptions}
          defaults={{
            identityKey: '',
            fullName: clerkName,
            jobTitle: '',
            city: '',
            favoriteNflTeam: '',
            favoritePlayer: '',
          }}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
