import type { Metadata } from "next";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { Providers } from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { geologica } from "@/components/ui/fonts";

import AuthModal from "@/components/auth/auth-modal";
import LogOutModal from "@/components/modals/logout";
import { ErrorBoundary } from "@/components/error-boundary";

import "./globals.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === "production"
  ? "https://naruchky.com"
  : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await getTranslations("Layout.metadata");

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: t("title"),
        template: "%s | Na.Ruchky",
      },
      description: t("description"),
      keywords: t.raw("keywords"),
      authors: [{ name: "Na.Ruchky" }],
      creator: "Na.Ruchky",
      openGraph: {
        type: "website",
        locale: "uk_UA",
        url: baseUrl,
        siteName: "Na.Ruchky",
        title: t("openGraphTitle"),
        description: t("openGraphDescription"),
      },
      twitter: {
        card: "summary_large_image",
        title: t("twitterTitle"),
        description: t("twitterDescription"),
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
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    // Fallback metadata
    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: "Na.Ruchky - Знайди свого ідеального компаньйона",
        template: "%s | Na.Ruchky",
      },
      description:
        "Відкрий тисячі домашніх тварин та порід. Знайди свого ідеального компаньйона через наш комплексний каталог домашніх тварин.",
      keywords: [
        "домашні тварини",
        "усиновлення",
        "породи",
        "собаки",
        "коти",
        "каталог тварин",
      ],
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geologica.className} antialiased max-w-[1440px] mx-auto`}
      >
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <Providers>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <AuthModal />
              <LogOutModal />
            </Providers>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
