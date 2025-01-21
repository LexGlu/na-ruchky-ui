import Image from "next/image";
import Link from "next/link";
import dog from "@/public/dog.gif";

// Draft 404 page

export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-[20px] p-6 m-1 bg-white">
        <h2 className="text-4xl font-bold text-gray-900">Сторінку не знайдено</h2>
        <Image
            src={dog}
            alt="Na.ruchky"
            className="rounded-[20px] shadow-lg"
            priority
            unoptimized={true}
        />
        <p className="text-lg text-gray-700 text-center max-w-md">
          На жаль, ми не змогли знайти запитаний ресурс.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-[#CAF97C] opacity-90 text-black rounded-3xl font-medium
                     transition-all duration-200 hover:opacity-100
                     active:transform active:scale-95"
        >
          <span>←&nbsp;&nbsp;Повернутися на головну</span>
        </Link>
      </div>
    );
  }