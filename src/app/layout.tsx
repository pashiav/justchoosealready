import type { Metadata } from "next";
import { Nunito, Lilita_One, League_Spartan } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { NextAuthProvider } from "@/components/next-auth-provider";
import { PostHogProvider, PostHogPageview } from "@/components/posthog-provider";
import Footer from "@/components/Footer";
import Pattern from "@/components/Pattern";

const nunito = Nunito({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const lilitaOne = Lilita_One({ 
  weight: "400",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const leagueSpartan = League_Spartan({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "JUST CHOOSE ALREADY",
  description:
    "Let the Wheel Decide Your Meal.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  other: {
    'google-fonts': 'https://fonts.googleapis.com',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${nunito.className} ${lilitaOne.className} ${leagueSpartan.className} bg-[#ffecc7]`}>
        {/* Background Pattern - SVG pattern embedded as CSS */}
        <Pattern screen="fixed" />
        {/* Main Content Container - appears above background */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <PostHogProvider>
            <PostHogPageview />
            <NextAuthProvider>
              <Header />
              <main className="flex-1 pt-4">
                {children}
              </main>
              <Footer />
            </NextAuthProvider>
          </PostHogProvider>
        </div>
      </body>
    </html>
  );
}
