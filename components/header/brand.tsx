"use client";

import React from "react";
import Link from "next/link";

interface BrandProps {
  title: string;
}

export default function Brand({ title }: BrandProps) {
  return (
    <Link
      href="/"
      className="text-[29px] font-medium text-[#333333] cursor-pointer"
    >
      {title}
    </Link>
  );
}
