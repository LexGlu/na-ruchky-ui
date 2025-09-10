import { NewListingsClient } from "./new-listings.client";
import { getNewPetListingsCache } from "@/lib/cache/pets.cache";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Section from "@/components/layout/section";

export const revalidate = 1800;
export const dynamic = "force-static";

export default async function NewListings() {
  const t = await getTranslations("NewListings");
  const newPets = await getNewPetListingsCache();
  const displayedPets = newPets.slice(0, 4);

  return (
    <Section
      padding="lg"
      inner
      max="site"
      className="bg-white rounded-3xl"
      ariaLabel={t("title")}
    >
      <div className="flex flex-col gap-6 md:gap-8">
        <h2 className="font-semibold text-2xl leading-10 sm:text-3xl md:text-[40px] md:leading-10 text-black">
          {t("title")}
        </h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-[117px]">
          <div className="md:w-[903px]" role="list">
            <NewListingsClient pets={displayedPets} hideArrows />
          </div>
          <div className="flex flex-col gap-4 md:gap-[32px] md:justify-end md:w-[316px]">
            <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2 md:h-[195px]">
              <div className="font-medium text-[64px] leading-[64px] md:text-[164px] md:leading-[164px] text-[#CCF28C] select-none whitespace-nowrap">
                {t("newCountPrefix")}
                20
              </div>
              <p className="text-[16px] leading-4 md:text-[18px] md:leading-[21px] text-black md:max-w-full max-w-[197px]">
                {t("newCountDescription")}
              </p>
            </div>
            <Link
              href="/#all-pets"
              className="inline-flex items-center justify-center h-[50px] w-full md:w-[316px] rounded-md bg-black text-white text-sm px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
