"use client";

import React, { useState } from "react";
import { Squash as Hamburger } from "hamburger-react";

import HeaderBrand from "./header-brand";
import HeaderDesktopNav, { NavLink } from "./header-desktop-nav";
import HeaderMobileNav from "./header-mobile-nav";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    {
      label: "Загублені тварини",
      href: "/lost-animals",
    },
    {
      label: "Притулки/організації",
      href: "/shelters",
    },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className="bg-white shadow-sm p-1 m-1 rounded-[20px]"
      role="banner"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <HeaderBrand title="Na.ruchky" />

          <HeaderDesktopNav navLinks={navLinks} />

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle mobile navigation"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <Hamburger toggled={isMenuOpen} toggle={setIsMenuOpen} />
          </button>
        </div>
      </div>

      <HeaderMobileNav
        navLinks={navLinks}
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />
    </header>
  );
}
