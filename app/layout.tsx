import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/header/header";

import { geologica } from "@/components/ui/fonts";

export const metadata: Metadata = {
  title: {
    template: '%s | Na.Ruchky',
    default: 'Na.Ruchky',
  },
  description: 'Na.Ruchky is a convenient service for finding pets',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geologica.className} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}