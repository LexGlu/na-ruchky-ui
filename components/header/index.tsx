"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Squash as Hamburger } from "hamburger-react";

import Brand from "@/components/header/brand";
import DesktopNav from "@/components/header/desktop-nav";
import MobileNav from "@/components/header/mobile-nav";
import HeaderActions from "@/components/header/actions";
import { navLinks } from "@/components/header/data";

/**
 * The main Header component used in layout.tsx
 */
export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileOpen(false);

  return (
    <header
      className="bg-white shadow-sm p-2 mb-1 rounded-[20px]"
      role="banner">
      <div className="px-1 sm:px-2">
        <div className="flex h-16 items-center justify-between">
          {/* Brand logo/title */}
          <Brand title="Na.ruchky" />

          {/* Desktop nav */}
          <DesktopNav navLinks={navLinks}>
            {/* The right side actions for desktop */}
            <div className="flex gap-[6px]">
              <Link
                href="/"
                className="bg-[#CAF97C] hover:bg-lime-400 text-black font-normal py-[10px] px-[26px] rounded-2xl"
                aria-label="Add announcement">
                Додати оголошення
              </Link>

              <HeaderActions />
            </div>
          </DesktopNav>

          {/* Mobile nav toggle (hamburger) */}
          <div className="md:hidden text-gray-700">
            <Hamburger
              toggled={isMobileOpen}
              toggle={toggleMobileNav}
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <MobileNav
        navLinks={navLinks}
        isOpen={isMobileOpen}
        onClose={closeMobileNav}>
        {/* The right side actions for mobile */}
        <HeaderActions />
      </MobileNav>
    </header>
  );
}
