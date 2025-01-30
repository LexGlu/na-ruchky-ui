import { notFound } from "next/navigation";
import PetDetail from "@/components/pets/pet-listing-detail";

import { fetchPetListing } from "@/lib/api/pets";
import { FetchError } from "@/lib/types/errors";
import { validateUUID } from "@/lib/utils/validate-uuid";

export default async function PetPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const uuid = (await params).uuid;

  // Validate UUID format before fetching the pet listing from backend
  if (!validateUUID(uuid)) {
    notFound();
  }

  try {
    const petListing = await fetchPetListing(uuid);
    return <PetDetail listing={petListing} />;
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
