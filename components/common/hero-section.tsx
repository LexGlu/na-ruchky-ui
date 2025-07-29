import Image from "next/image";
import { getTranslations } from "next-intl/server";

import SearchBar from "@/components/search/search-bar";

import heroDogMascot from "@/public/images/hero-mascot-dog.svg";

const HeroSection = async () => {
  const t = await getTranslations("HomePage");

  return (
    <div
      className="bg-[#CCF28C] rounded-b-[17px] py-8 px-4 sm:px-12 relative text-black mb-[2px]"
      id="hero-section"
    >
      <div className="container flex flex-col mx-auto gap-0 sm:gap-[100px]">
        <h1 className="w-2/3 text-4xl sm:text-[96px]/[82px] font-bold text-left">
          {t("title")
            .split("\n")
            .map((line, index, array) => (
              <span key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </span>
            ))}
        </h1>

        <div className="relative mt-6">
          <div className="hidden sm:block absolute -top-[346px] right-26 lg:right-28 xl:right-22 z-10 pointer-events-none">
            <Image
              src={heroDogMascot}
              alt="Dog mascot with speech bubble"
              width={404}
              height={386.7}
              className="object-contain"
              priority
            />
          </div>

          <div className="sm:hidden absolute -top-[131px] -right-3 z-10 pointer-events-none">
            <Image
              src={heroDogMascot}
              alt="Dog mascot with speech bubble"
              width={180}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
