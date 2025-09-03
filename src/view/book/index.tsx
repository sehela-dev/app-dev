import { MainFooterComponent } from "@/components/layout";
import Image from "next/image";

export const BookClassView = () => {
  return (
    <div className="flex flex-col w-full gap-8 font-serif mx-auto py-8 h-dvh">
      <div className="flex w-full px-4 flex-col gap-8 h-full">
        <h2 className="text-brand-500 font-extrabold text-[32px]">Book Class</h2>
        <div className="flex flex-col gap-2.5 leading-[130%]">
          <div className="flex items-center gap-2.5  cursor-pointer">
            <div className="relative w-full max-w-[138px] h-[97px]">
              <Image src="/assets/book-page/yoga-class.png" alt="yoga-class" width={138} height={97} className="w-full h-full" objectFit="fill" />
            </div>
            <div className="">
              <p className="text-brand-500 font-bold">Yoga Class</p>
              <p className="text-brand-500 text-sm font-normal">Stretch, strengthen, and relax your mind and body.</p>
            </div>
          </div>
          {/*  */}
          <div className="flex items-center gap-2.5   ">
            <div className="relative w-full max-w-[138px] h-[97px]">
              <Image src="/assets/book-page/ballet-class.png" alt="ballet-class" width={138} height={97} className="w-full h-full" objectFit="fill" />
            </div>
            <div className="">
              <p className="text-brand-500 font-bold">Ballet Class</p>
              <p className="text-brand-500 text-sm font-normal">Learn graceful moves with strength and precision.</p>
            </div>
          </div>
          {/*  */}
          <div className="flex items-center gap-2.5  cursor-pointer">
            <div className="relative w-full max-w-[138px] h-[97px]">
              <Image
                src="/assets/book-page/pilates-class.png"
                alt="pilates-class"
                width={138}
                height={97}
                className="w-full h-full"
                objectFit="fill"
              />
            </div>
            <div className="">
              <p className="text-brand-500 font-bold">Pilates Class</p>
              <p className="text-brand-500 text-sm font-normal">Improve posture, core strength, and balance.</p>
            </div>
          </div>
        </div>
      </div>

      <MainFooterComponent />
    </div>
  );
};
