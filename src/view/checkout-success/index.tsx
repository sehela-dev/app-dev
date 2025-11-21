"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const CheckoutSuccessView = () => {
  return (
    <div className="relative flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500">
      <div className="flex flex-col items-center gap-4 text-center mt-12 /">
        <Image src={"/assets/view/success.png"} alt="success" width={120} height={120} />
        <p className="font-extrabold text-xl">We’ve Got Your Payment!</p>
        <p className="font-normal">Our admin will contact you via WhatsApp to provide details on the cost and same-day delivery.</p>
        <Button className="min-h-12 text-sm font-extrabold">Explore Products</Button>
      </div>
    </div>
  );
};
