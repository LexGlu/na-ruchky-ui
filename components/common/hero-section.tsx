import Image from "next/image";
import { getTranslations } from "next-intl/server";
import SearchBar from "@/components/search/search-bar";
import Section from "@/components/layout/section";
import heroDogMascot from "@/public/images/hero-mascot-dog.svg";

function SplitLines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default async function HeroSection() {
  const t = await getTranslations("HomePage");

  return (
    <Section
      id="hero-section"
      padding="lg"
      inner
      max="site"
      // Using direct arbitrary color to avoid any Tailwind config ambiguity
      className="bg-[#CCF28C] rounded-b-[17px] relative text-black"
      innerClassName="flex flex-col gap-[42px] sm:gap-[100px]"
    >
      <h1 className="w-full sm:w-2/3 text-[48px]/[46px] sm:text-[96px]/[82px] font-bold text-left font-geologica">
        <SplitLines text={t("title") as string} />
      </h1>
      <div className="relative sm:mt-6">
        <div className="hidden sm:block absolute -top-[346px] right-10 lg:right-20 xl:right-24 z-10 pointer-events-none">
          <Image
            src={heroDogMascot}
            alt="Dog mascot with speech bubble"
            width={404}
            height={386.7}
            className="object-contain"
            priority
          />
        </div>
        <SearchBar />
      </div>
    </Section>
  );
}
