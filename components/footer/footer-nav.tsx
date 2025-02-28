"use client";

import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Загублені тварини", href: "/lost-animals" },
  { label: "Як ми працюємо", href: "/how-it-works" },
  { label: "Контакти", href: "/contacts" },
  { label: "Для розвідників тварин", href: "/breeders" },
  { label: "Притулки/організації", href: "/shelters" },
  { label: "FAQ", href: "/faq" },
  { label: "Політика конфіденційності", href: "/privacy" },
  { label: "Для волонтерів", href: "/volunteers" },
];

export default function FooterNav() {
  return (
    <nav
      className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-x-10 sm:gap-x-14 gap-y-4 text-black"
      aria-label="Footer navigation">
      {navLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="hover:underline focus:underline text-sm sm:text-lg">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
