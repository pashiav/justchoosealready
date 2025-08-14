import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { NextAuthProvider } from "@/components/next-auth-provider";
import Footer from "@/components/Footer";
import Pattern from "@/components/Pattern";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Just Choose Already - Restaurant Decision Wheel",
  description:
    "Can't decide where to eat? Let our magical wheel choose the perfect restaurant for you!",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body className={inter.className + " bg-[#ffecc7]"}>
        {/* Background Pattern - SVG pattern embedded as CSS */}
        <Pattern screen="fixed" />
        {/* Main Content Container - appears above background */}
        <div className="relative z-10">
          <NextAuthProvider>
            <Header />
            {children}
            <Footer />
          </NextAuthProvider>
        </div>
      </body>
    </html>
  );
}
