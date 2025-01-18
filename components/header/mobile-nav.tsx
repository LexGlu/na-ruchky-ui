"use client";

import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { NavLink } from "@/components/header/data";

interface MobileNavProps extends PropsWithChildren {
  navLinks: NavLink[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Renders mobile nav, toggled by hamburger.
 * We pass children to show user actions (login/logout) in the mobile panel as well.
 */
export default function MobileNav({
  navLinks,
  isOpen,
  onClose,
  children,
}: MobileNavProps) {
  return (
    <div
      className={`
        md:hidden bg-transparent shadow-sm
        transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-[500px]" : "max-h-0"}
        overflow-hidden
      `}
      role="navigation"
    >
      {/* Nav Links */}
      <div className="px-4 pt-2 pb-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block text-black hover:text-gray-700 px-3 py-2 rounded-md"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Action Buttons or Children */}
      <div className="flex px-4 py-2 gap-2 justify-between">
        {children}
      </div>
    </div>
  );
}
