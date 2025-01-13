"use client";

import Link from "next/link";
import HeaderActions from "./header-actions";
import { NavLink } from "./header-desktop-nav";

interface HeaderMobileNavProps {
  navLinks: NavLink[];
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderMobileNav({
  navLinks,
  isOpen,
  onClose,
}: HeaderMobileNavProps) {
  return (
    <div
      className={`
        md:hidden bg-transparent shadow-sm
        transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-[500px]" : "max-h-0"}
        overflow-hidden
      `}
      role="navigation"
      id="mobile-menu"
    >
      {/* Nav Links */}
      <div className="px-4 pt-2 pb-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block text-black hover:text-gray-700 px-3 py-2 rounded-md"
            aria-label={link.label}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* CTA + Actions */}
      <div className="flex px-4 py-2 gap-2 justify-between">
        <Link
          href="/"
          onClick={onClose}
          className="block bg-[#CAF97C] hover:bg-lime-400 text-black font-semibold px-3 py-2 rounded-2xl"
          aria-label="Add announcement"
        >
          Додати оголошення
        </Link>
        <HeaderActions />
      </div>
    </div>
  );
}
