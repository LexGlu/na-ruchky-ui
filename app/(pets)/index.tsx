import { fetchPetListings } from "@/lib/api/pets";
import PetsFilter from "@/components/pets/pet-filter";
import PetList from "@/components/pets/pet-list";

export default async function PetsPage() {
  const petListings = await fetchPetListings();
  return (
    <div className="flex flex-col w-full py-8 px-4 bg-white rounded-[20px]">
      <PetsFilter />
      <PetList petListings={petListings} />
    </div>
  );
}
