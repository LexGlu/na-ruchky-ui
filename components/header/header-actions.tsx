"use client";

import Link from "next/link";
import Image from "next/image";
import paw from "@/public/paw-dark.svg";

export default function HeaderActions() {
  return (
    <div className="flex space-x-0">
      <Link
        href="/login"
        className="bg-[#2A2B3C] text-white font-normal hover:opacity-95 py-[10px] px-[26px] rounded-2xl"
        aria-label="Log in"
      >
        Увійти
      </Link>
      <Link
        href="/"
        className="flex bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[15px] rounded-3xl"
        aria-label="Go to main page"
      >
        <Image src={paw} alt="paw icon" />
      </Link>
    </div>
  );
}
