"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Image from "next/image";
import { useTranslations } from "next-intl";

import HeaderLogo from "@/components/header/logo";
import DesktopNav from "@/components/header/desktop-nav";
import MobileNav from "@/components/header/mobile-nav";
import HeaderActions from "@/components/header/actions";

import { navLinks } from "@/components/header/data";

import paw from "@/public/paw-dark.svg";

/**
 * The main Header component used in layout.tsx
 */
export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlternateDesign, setIsAlternateDesign] = useState(!isHomePage);
  const heroSectionRef = useRef<HTMLDivElement | null>(null);

  const t = useTranslations("Header.actions");
  const closeMobileNav = () => setIsMobileOpen(false);

  useEffect(() => {
    const heroElement = document.getElementById(
      "hero-section"
    ) as HTMLDivElement | null;
    if (heroElement) {
      heroSectionRef.current = heroElement;
    }

    const handleScroll = () => {
      if (!isHomePage) {
        setIsAlternateDesign(true);
        return;
      }

      if (heroSectionRef.current) {
        const { bottom } = heroSectionRef.current.getBoundingClientRect();
        setIsAlternateDesign(bottom < 100);
      } else {
        setIsAlternateDesign(false);
      }
    };

    // Run once on component mount to establish initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, isHomePage]);

  const headerBaseClasses =
    "p-2 sticky top-0 z-[49] transition-colors duration-300 ease-in-out";
  const headerDynamicClasses = isAlternateDesign
    ? "bg-white rounded-b-[17px] mb-[2px]"
    : "bg-[#CCF28C]";

  const addAnnouncementLinkBaseClasses =
    "font-normal py-[10px] px-[26px] rounded-lg";
  const addAnnouncementLinkColorClasses = isAlternateDesign
    ? "bg-[#CCF28C] text-black hover:opacity-90" // Lime button on white header
    : "bg-white text-black hover:bg-gray-100"; // White button on lime header

  const addAnnouncementLinkForMobile = (
    <Link
      href="/add-listing"
      className={`${addAnnouncementLinkBaseClasses} ${addAnnouncementLinkColorClasses} w-full text-center block`}
      onClick={closeMobileNav}
      aria-label="Додати оголошення"
    >
      Додати оголошення
    </Link>
  );

  return (
    <header
      className={`${headerBaseClasses} ${headerDynamicClasses}`}
      role="banner"
    >
      <div className="container mx-auto px-1 sm:px-2">
        <div className="flex h-16 items-center justify-between">
          <HeaderLogo />

          <DesktopNav navLinks={navLinks}>
            <div className="flex items-center gap-[6px]">
              <Link
                href="/add-listing"
                className={`${addAnnouncementLinkBaseClasses} ${addAnnouncementLinkColorClasses}`}
                aria-label="Додати оголошення"
              >
                Додати оголошення
              </Link>
              <HeaderActions />
            </div>
          </DesktopNav>

          <button
            type="button"
            className="flex md:hidden bg-black text-white hover:opacity-95 py-[10px] px-[11px] justify-center items-center rounded-full cursor-pointer"
          >
            <Image src={paw} alt={t("pawIcon")} className="-rotate-18" />
          </button>
        </div>
      </div>

      <MobileNav
        navLinks={navLinks}
        isOpen={isMobileOpen}
        onClose={closeMobileNav}
      >
        <div className="flex flex-col items-center gap-4 p-4">
          {addAnnouncementLinkForMobile}
          <HeaderActions />
        </div>
      </MobileNav>
    </header>
  );
}
