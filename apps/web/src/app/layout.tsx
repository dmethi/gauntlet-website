import type { Metadata } from 'next';
import { geizer, montserrat } from '@/lib/fonts';
import './globals.css';
import ClientLayout from '@/components/client-layout';
import { Providers } from '@/components/providers';
import { SITE_NAME, SITE_ORIGIN, siteRobotsDirective } from '@/lib/site';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const SITE_TITLE = 'The Gauntlet - Fantasy Football';
const SITE_DESCRIPTION = 'Medieval fantasy football with balanced red & gold aesthetics';

/**
 * Document-wide metadata. Feature pages override `title`/`description` and
 * inherit the rest — the origin, social defaults, and crawl policy live here so
 * they are declared once. See `@/lib/site` for the indexing policy itself.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: siteRobotsDirective(),
  // No `openGraph.url` here on purpose: a value set in the root layout is
  // inherited by every page, so each recap report and manager profile would
  // advertise the home page as its permanent share URL. Per-page `og:url` and
  // canonical ownership is a follow-up, not a default.
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3E9D2' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${geizer.variable}`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
