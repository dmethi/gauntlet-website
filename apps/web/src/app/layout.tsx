import { montserrat, geizer } from '@/lib/fonts';
import './globals.css';
import ClientLayout from '@/components/client-layout';

export const metadata = {
  title: 'The Gauntlet - Fantasy Football',
  description: 'Medieval fantasy football with balanced red & gold aesthetics',
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
    <html lang='en' suppressHydrationWarning>
      <body className={`${montserrat.variable} ${geizer.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
