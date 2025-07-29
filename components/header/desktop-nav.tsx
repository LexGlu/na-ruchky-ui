"use client";

import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/header/data";

interface DesktopNavProps extends PropsWithChildren {
  navLinks: NavLink[];
}

/**
 * Renders desktop navigation.
 * Receives navLinks array + optional "children" for the right side (e.g. actions).
 */
export default function DesktopNav({ navLinks, children }: DesktopNavProps) {
  const t = useTranslations();

  return (
    <nav className="hidden md:flex space-x-6 items-center">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-black hover:text-gray-700"
        >
          {t(link.labelKey)}
        </Link>
      ))}
      {/* Render any extra actions (login, register, etc.) on the right */}
      <div className="flex gap-[6px]">{children}</div>
    </nav>
  );
}
