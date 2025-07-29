"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FooterAddListingButton() {
  const t = useTranslations("Footer");

  return (
    <div className="flex justify-end self-start w-full sm:w-auto">
      <Link
        href="/add-ad"
        className="w-full sm:w-auto text-center inline-block bg-black text-white text-nowrap py-2 px-5 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
        aria-label={t("addListingAria")}
      >
        {t("addListing")}
      </Link>
    </div>
  );
}
