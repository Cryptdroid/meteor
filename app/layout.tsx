import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ColorblindWrapper from "../components/ui/ColorblindWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asteroid Impact Simulator - Defend Earth",
  description: "Interactive visualization and simulation platform for asteroid impact scenarios, deflection strategies, and planetary defense",
  keywords: ["asteroid", "impact", "simulation", "NASA", "planetary defense", "NEO"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0B0D0F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} overflow-x-hidden min-h-screen touch-manipulation`}>
        <ColorblindWrapper>
          {children}
        </ColorblindWrapper>
      </body>
    </html>
  );
}
