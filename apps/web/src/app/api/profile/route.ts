import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isProfileIdentityConflict } from '@/features/profiles/repository';
import { saveProfile } from '@/features/profiles/service';
import { profileInputSchema } from '@/features/profiles/validation';

export const runtime = 'nodejs';

export const PUT = async (request: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to save your profile.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The profile request was not valid JSON.' }, { status: 400 });
  }

  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Some profile fields are invalid. Check your entries and try again.' },
      { status: 400 },
    );
  }

  try {
    const result = await saveProfile(userId, parsed.data);
    if (!result.ok) {
      const error =
        result.code === 'IDENTITY_CLAIMED'
          ? 'That Sleeper identity is already connected to another profile.'
          : 'That Sleeper manager is no longer attached to the selected team.';
      return NextResponse.json({ error }, { status: 409 });
    }

    return NextResponse.json({ profile: result.profile });
  } catch (error) {
    if (isProfileIdentityConflict(error)) {
      return NextResponse.json(
        { error: 'That Sleeper identity is already connected to another profile.' },
        { status: 409 },
      );
    }

    console.error('Failed to save member profile', error);
    return NextResponse.json(
      { error: 'We could not save your profile. Try again in a moment.' },
      { status: 500 },
    );
  }
};
