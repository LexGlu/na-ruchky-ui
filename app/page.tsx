import Image from "next/image";
import heroImage from "@/public/hero-image.png";

import PetsPage from "@/app/(pets)/page";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Image
        src={heroImage}
        alt="Na.ruchky"
      />
      <PetsPage></PetsPage>
    </div>
  );
}
