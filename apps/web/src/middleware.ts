import { clerkMiddleware } from '@clerk/nextjs/server';

// Authorization stays beside the data it protects: server pages use requireUserId,
// while the profile route returns 401 before reading or writing profile data.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api)(.*)',
  ],
};
