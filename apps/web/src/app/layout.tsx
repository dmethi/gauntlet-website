import React from "react";
import "./globals.css";
import { 
  inter, 
  montserrat, 
  geizer, 
  roboto, 
  workSans, 
  firaSans, 
  ibmPlexSans,
  poppins
} from "@/lib/fonts";

export const metadata = {
  title: "The Gauntlet - High-Stakes Fantasy Football",
  description: "Advanced fantasy football platform with dynamic scoring and simulation",
  icons: {
    icon: [
      { url: '/gauntlet_logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B1538',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`
        ${workSans.variable} 
        ${geizer.variable} 
        ${inter.variable} 
        ${montserrat.variable} 
        ${roboto.variable}
        ${firaSans.variable}
        ${ibmPlexSans.variable}
        ${poppins.variable}
        font-sans antialiased overflow-x-hidden
      `}>
        {children}
      </body>
    </html>
  );
}
