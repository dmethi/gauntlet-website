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
