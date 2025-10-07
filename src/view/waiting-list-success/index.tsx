"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const SuccessWaitingListView = () => {
  return (
    <div className="relative flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500">
      <div className="flex flex-col items-center gap-4 text-center mt-12 /">
        <Image src={"/assets/view/success.png"} alt="success" width={120} height={120} />
        <p className="font-extrabold text-xl">You’re on the list!</p>
        <p className="font-normal">We’ll let you know via email if a spot opens.</p>
        <Button className="min-h-12 text-sm font-extrabold">Explore Other Class</Button>
      </div>
    </div>
  );
};
