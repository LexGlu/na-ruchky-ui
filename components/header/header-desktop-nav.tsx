"use client";

import Link from "next/link";
import HeaderActions from "./header-actions";

export interface NavLink {
  label: string;
  href: string;
}

interface HeaderDesktopNavProps {
  navLinks: NavLink[];
}

export default function HeaderDesktopNav({ navLinks }: HeaderDesktopNavProps) {
  return (
    <nav className="hidden md:flex space-x-6 items-center">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-black hover:text-gray-700"
          aria-label={link.label}
        >
          {link.label}
        </Link>
      ))}

      <div className="flex gap-[6px]">
        <Link
          href="/"
          className="bg-[#CAF97C] hover:bg-lime-400 text-black font-normal py-[10px] px-[26px] rounded-2xl"
          aria-label="Add announcement"
        >
          Додати оголошення
        </Link>

        <HeaderActions />
      </div>
    </nav>
  );
}
