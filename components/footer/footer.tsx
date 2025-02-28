"use client";

import FooterNav from "@/components/footer/footer-nav";
import FooterDonate from "@/components/footer/footer-donate";

export default function Footer() {
  return (
    <footer
      className="bg-white w-full border-t border-gray-200 p-1 mt-1 rounded-t-[20px] max-h-[430px] overflow-hidden"
      role="contentinfo">
      {/* Container */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: navigation links */}
        <FooterNav />

        {/* Right side: donate button */}
        <FooterDonate />
      </div>
      <div>
        <span className="font-medium text-[90px] lg:text-[310px] text-[#333333] tracking-[-.04em]">
          Na.ruchky
        </span>
      </div>
    </footer>
  );
}
