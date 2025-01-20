"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Squash as Hamburger } from "hamburger-react";

import Brand from "@/components/header/brand";
import DesktopNav from "@/components/header/desktop-nav";
import MobileNav from "@/components/header/mobile-nav";
import HeaderActions from "@/components/header/actions";
import { navLinks } from "@/components/header/data";

import { useAuth } from "@/store/auth-store";

/**
 * The main Header component used in layout.tsx
 */
export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const authState = useAuth();

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileOpen(false);

  return (
    <header
      className="bg-white shadow-sm p-1 m-1 rounded-[20px]"
      role="banner"
    >
      <div className="px-4 sm:px-6 lg:px-8">
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
                aria-label="Add announcement"
              >
                Додати оголошення
              </Link>

              <HeaderActions {...authState} />
            </div>
          </DesktopNav>

          {/* Mobile nav toggle (hamburger) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle mobile navigation"
            onClick={toggleMobileNav}
          >
            <Hamburger toggled={isMobileOpen} toggle={setIsMobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <MobileNav
        navLinks={navLinks}
        isOpen={isMobileOpen}
        onClose={closeMobileNav}
      >
        {/* The right side actions for mobile */}
        <HeaderActions {...authState} />
      </MobileNav>
    </header>
  );
}
