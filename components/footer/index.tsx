"use client";

import Image from "next/image";
import Link from "next/link";

import FooterNav from "@/components/footer/footer-nav";
import FooterAddListingButton from "@/components/footer/add-listing-btn";
import Mascots from "@/components/header/mascots";

import FooterLogoImage from "@/public/logo-footer.svg";

export default function Footer() {
  return (
    <footer
      className="flex flex-col bg-white w-full border-t border-gray-200 p-1 mt-1 rounded-t-[20px] overflow-hidden 
                 gap-[40px] md:gap-[60px] lg:gap-[80px]"
      role="contentinfo"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="w-full md:flex-grow">
            {" "}
            <FooterNav />
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto flex justify-center md:justify-end md:flex-shrink-0">
            <FooterAddListingButton />
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-[24px] pb-6 md:pb-8">
        <Image
          src={FooterLogoImage}
          alt="Ruchky"
          className="hidden md:block md:w-auto md:max-w-[100%] h-[154px]"
          style={{ maxWidth: "1336px" }}
          width={1336}
          height={154}
          priority
        />
        <div
          className="w-full flex flex-col items-center text-center gap-4 
                        md:flex-row md:justify-between md:items-center md:text-left text-black"
        >
          <span className="text-sm">
            © 2025 Na.ruchky. All rights reserved.
          </span>
          <div
            className="flex flex-col items-center gap-3 
                          sm:flex-row sm:gap-6 lg:gap-[86px]"
          >
            <Link href="/privacy" className="text-sm hover:text-gray-700">
              Політика конфіденційності
            </Link>
            <Link href="/terms" className="text-sm hover:text-gray-700">
              Договір публічної оферти
            </Link>
          </div>
        </div>
        <Mascots />
      </div>
    </footer>
  );
}
