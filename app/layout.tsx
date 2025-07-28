import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { geologica } from "@/components/ui/fonts";

import AuthModal from "@/components/auth/auth-modal";
import LogOutModal from "@/components/modals/logout";
import { ErrorBoundary } from "@/components/error-boundary";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === "production"
  ? "https://naruchky.com"
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Na.Ruchky - Find Your Perfect Companion",
    template: "%s | Na.Ruchky",
  },
  description:
    "Discover thousands of pets and breeds. Find your perfect companion through our comprehensive pet directory.",
  keywords: ["pets", "adoption", "breeds", "dogs", "cats", "pet directory"],
  authors: [{ name: "Na.Ruchky" }],
  creator: "Na.Ruchky",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Na.Ruchky",
    title: "Na.Ruchky - Find Your Perfect Companion",
    description:
      "Discover thousands of pets and breeds. Find your perfect companion through our comprehensive pet directory.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Na.Ruchky - Find Your Perfect Companion",
    description: "Find your perfect pet companion",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geologica.className} antialiased max-w-[1440px] mx-auto`}
      >
        <ErrorBoundary>
          <Providers>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <AuthModal />
            <LogOutModal />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
