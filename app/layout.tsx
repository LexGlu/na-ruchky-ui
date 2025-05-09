import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { geologica } from "@/components/ui/fonts";

import AuthModal from "@/components/auth/auth-modal";
import LogOutModal from "@/components/modals/logout";

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
      <body
        className={`${geologica.className} antialiased max-w-[1440px] mx-auto`}
      >
        <Header />
        {children}
        <Footer />
        <AuthModal />
        <LogOutModal />
      </body>
    </html>
  );
}
