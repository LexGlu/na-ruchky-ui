import { fetchPetListings } from "@/lib/api/pets";
import PetList from "@/components/pets/pet-list";

export default async function PetsPage() {
  const petListings = await fetchPetListings();
  return (
    <div className="flex flex-col w-full py-8 px-4 bg-white rounded-[20px]">
      <h1 className="text-3xl font-bold mb-6 text-black">Наші спеціалісти</h1>
      <PetList petListings={petListings} />
    </div>
  );
}
