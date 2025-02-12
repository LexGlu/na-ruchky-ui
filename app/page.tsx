import Image from "next/image";
import heroImage from "@/public/hero-image.png";

import PetsPage from "@/app/(pets)";
import { VolunteerSection } from "@/components/volunteer/volunteer-section";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Image src={heroImage} alt="Na.ruchky" priority />
      <PetsPage></PetsPage>
      <VolunteerSection></VolunteerSection>
    </div>
  );
}
