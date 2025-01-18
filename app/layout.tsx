import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/header";
import Footer from "@/components/footer/footer";
import { geologica } from "@/components/ui/fonts";

import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: {
    template: "%s | Na.Ruchky",
    default: "Na.Ruchky",
  },
  description: "Na.Ruchky is a convenient service for finding pets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geologica.className} antialiased max-w-[1440px] mx-auto`}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
