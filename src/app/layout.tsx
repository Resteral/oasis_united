import type { Metadata } from 'next';
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OasisUnited | Connect & Order",
  description: "The premium platform for business connections and ordering.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import PayPalProvider from "@/components/PayPalProvider";
import GlobalNav from "@/components/GlobalNav";
import UnifiedHeader from "@/components/UnifiedHeader";
import PWARegister from "@/components/PWARegister";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans`}>
        <PWARegister />
        <PWAInstallBanner />
        <PayPalProvider>
          <UnifiedHeader />
          {children}
          <GlobalNav />
        </PayPalProvider>
      </body>
    </html>
  );
}
