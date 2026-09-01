import { ClerkProvider } from '@clerk/nextjs';

export const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkConfigured) return <>{children}</>;

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/members"
      signUpFallbackRedirectUrl="/onboarding"
    >
      {children}
    </ClerkProvider>
  );
};
