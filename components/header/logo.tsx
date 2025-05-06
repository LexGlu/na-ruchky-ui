"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import HeaderLogoImage from "@/public/logo-header.svg";

export default function HeaderLogo() {
  return (
    <Link
      href="/"
      className="text-[29px] font-medium text-[#333333] cursor-pointer"
    >
      <Image
        src={HeaderLogoImage}
        alt="Ruchky"
        className="w-[220px] h-[25px]"
        width={220}
        height={25}
      />
    </Link>
  );
}
