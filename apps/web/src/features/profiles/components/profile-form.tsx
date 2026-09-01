'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileTeamOption } from '@gauntlet/types';
import { NFL_TEAMS } from '../constants';
import { ProfilePhotoField } from './profile-photo-field';

export interface ProfileFormDefaults {
  identityKey: string;
  fullName: string;
  jobTitle: string;
  city: string;
  favoriteNflTeam: string;
  favoritePlayer: string;
}

interface ProfileFormProps {
  mode: 'create' | 'edit';
  teamOptions: ProfileTeamOption[];
  defaults: ProfileFormDefaults;
}

const fieldClassName =
  'min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const destinationForMode = (mode: ProfileFormProps['mode']): string =>
  mode === 'create' ? '/managers' : '/profile?saved=1';

export const ProfileForm = ({ mode, teamOptions, defaults }: ProfileFormProps) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      identityKey: String(formData.get('identityKey') ?? ''),
      fullName: String(formData.get('fullName') ?? ''),
      jobTitle: String(formData.get('jobTitle') ?? ''),
      city: String(formData.get('city') ?? ''),
      favoriteNflTeam: String(formData.get('favoriteNflTeam') ?? ''),
      favoritePlayer: String(formData.get('favoritePlayer') ?? ''),
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'We could not save your profile. Try again.');
        return;
      }

      router.push(destinationForMode(mode));
      router.refresh();
    } catch {
      setError('We could not reach Gauntlet. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form onSubmit={saveProfile} className="space-y-8">
        <section className="space-y-4">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">
              Identity
            </p>
            <h2 className="mt-1 text-2xl font-bold">Connect your Gauntlet seat</h2>
          </div>
          <div>
            <label htmlFor="identityKey" className="mb-2 block text-sm font-semibold">
              Sleeper manager and team
            </label>
            <select
              id="identityKey"
              name="identityKey"
              defaultValue={defaults.identityKey}
              required
              className={fieldClassName}
            >
              <option value="" disabled>
                Choose your Sleeper identity
              </option>
              {teamOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.leagueName} · {option.teamName} · {option.sleeperDisplayName}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Co-managers appear separately but remain attached to the same roster.
            </p>
          </div>
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              defaultValue={defaults.fullName}
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
              className={fieldClassName}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-border pt-8">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">
              Beyond football
            </p>
            <h2 className="mt-1 text-2xl font-bold">Give people an opening</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="jobTitle" className="mb-2 block text-sm font-semibold">
                Job or field
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                defaultValue={defaults.jobTitle}
                maxLength={100}
                placeholder="Product designer"
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-semibold">
                City
              </label>
              <input
                id="city"
                name="city"
                defaultValue={defaults.city}
                autoComplete="address-level2"
                maxLength={100}
                placeholder="Chicago"
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="favoriteNflTeam" className="mb-2 block text-sm font-semibold">
                Favorite NFL team
              </label>
              <select
                id="favoriteNflTeam"
                name="favoriteNflTeam"
                defaultValue={defaults.favoriteNflTeam}
                className={fieldClassName}
              >
                <option value="">No favorite selected</option>
                {NFL_TEAMS.map(team => (
                  <option key={team.code} value={team.code}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="favoritePlayer" className="mb-2 block text-sm font-semibold">
                Favorite NFL player
              </label>
              <input
                id="favoritePlayer"
                name="favoritePlayer"
                defaultValue={defaults.favoritePlayer}
                maxLength={100}
                placeholder="Justin Jefferson"
                className={fieldClassName}
              />
            </div>
          </div>
        </section>

        {error && (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || teamOptions.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving profile…' : mode === 'create' ? 'Create profile' : 'Save changes'}
        </button>
      </form>

      <aside className="lg:border-l lg:border-border lg:pl-8">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">Portrait</p>
        <h2 className="mt-1 text-xl font-bold">Choose how you appear</h2>
        <p className="mt-2 mb-5 text-sm leading-relaxed text-muted-foreground">
          Upload a photo here, or keep your Sleeper avatar as the manager-page fallback.
        </p>
        <ProfilePhotoField />
      </aside>
    </div>
  );
};
