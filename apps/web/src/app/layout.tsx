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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`
        ${workSans.variable} 
        ${geizer.variable} 
        ${inter.variable} 
        ${montserrat.variable} 
        ${roboto.variable}
        ${firaSans.variable}
        ${ibmPlexSans.variable}
        ${poppins.variable}
        font-sans bg-gray-950 text-gray-100
      `}>
        {children}
      </body>
    </html>
  );
}
