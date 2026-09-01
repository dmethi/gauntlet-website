'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera } from 'lucide-react';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ProfilePhotoField = () => {
  const { isLoaded, user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Choose a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('Profile photos must be smaller than 5 MB.');
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      setMessage('Profile photo updated.');
    } catch {
      setMessage('We could not upload that photo. Try a different image.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isLoaded || !user) {
    return <div className="h-24 w-24 animate-pulse rounded-full bg-muted" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <img
        src={user.imageUrl}
        alt={`${user.fullName ?? 'Your'} profile`}
        className="h-24 w-24 rounded-full border-2 border-secondary/50 bg-muted object-cover"
      />
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={uploadPhoto}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {uploading ? 'Uploading photo…' : 'Choose profile photo'}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">PNG, JPEG, or WebP. Maximum 5 MB.</p>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
