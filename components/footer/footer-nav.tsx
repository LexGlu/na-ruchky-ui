"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface NavLinkItem {
  labelKey: string; // Translation key instead of hardcoded text
  href: string;
}

interface NavColumn {
  links: NavLinkItem[];
  className?: string;
}

const footerLinkColumns: NavColumn[] = [
  {
    className: "w-full md:w-[411px]",
    links: [
      {
        labelKey: "Footer.breeds.frenchBulldog",
        href: "/search?breed=french-bulldog",
      },
      {
        labelKey: "Footer.breeds.labradorRetriever",
        href: "/search?breed=labrador-retriever",
      },
      {
        labelKey: "Footer.breeds.germanShepherd",
        href: "/search?breed=german-shepherd",
      },
      { labelKey: "Footer.breeds.bulldog", href: "/search?breed=bulldog" },
      { labelKey: "Footer.breeds.poodle", href: "/search?breed=poodle" },
      { labelKey: "Footer.breeds.beagle", href: "/search?breed=beagle" },
      {
        labelKey: "Footer.breeds.yorkshireTerrier",
        href: "/search?breed=yorkshire-terrier",
      },
    ],
  },
  {
    className: "w-full md:w-[442px]",
    links: [
      { labelKey: "Footer.breeds.maineCoon", href: "/search?breed=maine-coon" },
      {
        labelKey: "Footer.breeds.britishShorthair",
        href: "/search?breed=british-shorthair",
      },
      {
        labelKey: "Footer.breeds.scottishFold",
        href: "/search?breed=scottish-fold",
      },
      { labelKey: "Footer.breeds.sphynx", href: "/search?breed=sphynx" },
      { labelKey: "Footer.breeds.bengal", href: "/search?breed=bengal" },
      { labelKey: "Footer.breeds.ragdoll", href: "/search?breed=ragdoll" },
      {
        labelKey: "Footer.breeds.abyssinian",
        href: "/search?breed=abyssinian",
      },
    ],
  },
  {
    className: "w-full md:w-[135px]",
    links: [
      { labelKey: "Footer.navigation.myAccount", href: "/account" },
      { labelKey: "Footer.navigation.howItWorks", href: "/how-it-works" },
      { labelKey: "Footer.navigation.faq", href: "/faq" },
    ],
  },
];

export default function FooterNav() {
  const t = useTranslations();

  return (
    <nav
      className="flex flex-col md:flex-row items-start md:gap-x-[9px] gap-y-6 md:gap-y-0 text-black w-full"
      aria-label={t("Footer.footerNavigation")}
    >
      {footerLinkColumns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`flex flex-col items-start gap-y-[12px] ${
            column.className || ""
          }`}
        >
          {column.links.map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              className="hover:underline focus:underline text-[14px] leading-[18px] font-normal text-black"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
