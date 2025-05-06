"use client";

import Link from "next/link";

interface NavLinkItem {
  label: string;
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
      { label: "Французький бульдог", href: "/search?breed=french-bulldog" },
      { label: "Лабрадор ретривер", href: "/search?breed=labrador-retriever" },
      { label: "Німецька вівчарка", href: "/search?breed=german-shepherd" },
      { label: "Бульдог", href: "/search?breed=bulldog" },
      { label: "Пудель", href: "/search?breed=poodle" },
      { label: "Бігль", href: "/search?breed=beagle" },
      { label: "Йоркширський тер'єр", href: "/search?breed=yorkshire-terrier" },
    ],
  },
  {
    className: "w-full md:w-[442px]",
    links: [
      { label: "Мейн-кун", href: "/search?breed=maine-coon" },
      {
        label: "Британська короткошерста",
        href: "/search?breed=british-shorthair",
      },
      { label: "Шотландська висловуха", href: "/search?breed=scottish-fold" },
      { label: "Сфінкс", href: "/search?breed=sphynx" },
      { label: "Бенгальська кішка", href: "/search?breed=bengal" },
      { label: "Рагдолл", href: "/search?breed=ragdoll" },
      { label: "Абіссинська", href: "/search?breed=abyssinian" },
    ],
  },
  {
    className: "w-full md:w-[135px]",
    links: [
      { label: "Мій кабінет", href: "/account" },
      { label: "Як ми працюємо", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export default function FooterNav() {
  return (
    <nav
      className="flex flex-col md:flex-row items-start md:gap-x-[9px] gap-y-6 md:gap-y-0 text-black w-full"
      aria-label="Footer navigation"
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
              key={link.label}
              href={link.href}
              className="hover:underline focus:underline text-[14px] leading-[18px] font-normal text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
