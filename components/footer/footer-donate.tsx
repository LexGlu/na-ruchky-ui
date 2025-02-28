"use client";

import Link from "next/link";

export default function FooterDonate() {
  return (
    <div className="flex justify-end self-start w-full sm:w-auto">
      <Link
        href="/donate"
        className="w-full sm:w-auto text-center inline-block bg-[#333333] text-white text-nowrap py-2 px-5 rounded-2xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
        aria-label="Задонатити хвостатим">
        Задонатити хвостатим
      </Link>
    </div>
  );
}
