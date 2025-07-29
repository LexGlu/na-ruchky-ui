import { NewListingsClient } from "./new-listings.client";
import { getNewPetListingsCache } from "@/lib/cache/pets.cache";
import { getTranslations } from "next-intl/server";

export const revalidate = 1800; // 30 minutes for new listings (more frequent updates)
export const dynamic = "force-static";

export default async function NewListings() {
  const t = await getTranslations("NewListings");
  // Fetch new pet listings from cache
  const newPets = await getNewPetListingsCache();

  return (
    <section className="bg-white rounded-2xl md:rounded-[24px] p-4 sm:p-6 md:p-8 w-full max-w-[1432px] mx-auto mb-8">
      <div className="w-full max-w-[1336px] mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-geologica font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
              {t("title")}
            </h2>
          </div>
        </div>

        <NewListingsClient pets={newPets} />
      </div>
    </section>
  );
}
