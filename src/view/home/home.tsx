import { LogoComponent } from "@/components/asset/logo";
import Image from "next/image";

export const HomeView = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="bg-brand-500 py-[40px]">
        <div className="font-serif flex-col justify-center items-center mx-auto w-[300px] text-center text-gray-50  ">
          <p className="font-extrabold text-[32px]  leading-[110%]">One Song Yoga Teacher Training </p>
          <p className="font-normal text-xl mt-4">One Song Yoga Teacher Training </p>
          <div className="flex items-center w-full justify-center mt-4 gap-4">
            <LogoComponent className="w-[99px] h-[32px]" src="sehela-light.png" />
            <div>
              <Image src={"/assets/one-song.png"} alt="one-song" width={48} height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
