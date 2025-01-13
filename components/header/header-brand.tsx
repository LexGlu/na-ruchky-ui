"use client";

import Link from "next/link";

interface HeaderBrandProps {
  title: string;
}

export default function HeaderBrand({ title }: HeaderBrandProps) {
  return (
    <div className="flex-shrink-0">
      <Link href="/">
        <span
          className="text-[29px] font-medium text-[#333333] cursor-pointer"
        >
          {title}
        </span>
      </Link>
    </div>
  );
}
