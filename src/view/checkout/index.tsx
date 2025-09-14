"use client";
import { CircleCheckSvg } from "@/components/asset/svg/CircleCheckSvg";
import { CircleInfoSvg } from "@/components/asset/svg/CircleInfoSvg";
import { CardCreditComponent } from "@/components/general/card-credit";
import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";

import { StickyContainerComponent } from "@/components/layout";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePaymentMethodCtx } from "@/context/payment-method.ctx";
import { X } from "lucide-react";
import { useState } from "react";

const walletContent = [
  {
    id: 1,
    title: "Yoga & Pillates",
    value: 12,
  },
  {
    id: 2,
    title: "Yoga, Pillates & Ballet",
    value: 3,
  },
  {
    id: 3,
    title: "Yoga, Pillates & Ballet",
    value: 5,
  },
];

export const CheckoutSessionView = () => {
  const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
  const { paymentType } = usePaymentMethodCtx();
  console.log("paymentType", paymentType);

  const onSelectWalletCredit = (id: number) => {
    if (selectedCredit === id) setSelectedCredit(null);
    else setSelectedCredit(id);
  };
  return (
    <>
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent />
        <div className="flex w-full px-4 sm:px-8 flex-col gap-4 h-auto  mt-4 overflow-auto">
          <h3 className="font-semibold">Order Items</h3>
          <CheckoutSessionCardComponent duration="20" location="TB Simatupang" date="Monday, 10 Aug 2025" time="08:00" title="Basic Yoga" />
          {paymentType === "cash" ? (
            <>
              <div>
                <div className="relative">
                  <Input className="min-h-[57px] border-brand-100 rounded-md" placeholder="Enter your coupon code here..." />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-500 font-semibold"
                    tabIndex={-1}
                    // onClick={() => setVisible((v) => !v)}
                  >
                    Apply
                  </button>
                </div>
                <div className="flex max-h-[57px] h-full w-full border bg-brand-100 border-brand-500 py-2.5 px-3 rounded-md justify-between items-center">
                  <div className="flex flex-row items-center w-full gap-2.5">
                    <CircleCheckSvg />
                    <div className="flex flex-col ">
                      <p className="text-sm font-medium">DISCBESAR</p>
                      <p className="text-xs">10% discount</p>
                    </div>
                  </div>

                  <Button className="w-5 h-5" variant={"ghost"}>
                    <X />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2.5 w-full">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="flex flex-row items-center justify-between w-full text-sm">
                  <p className=""> Subtotal</p>
                  <p className="text-right">Rp 200.000</p>
                </div>
                <div className="flex flex-row items-center justify-between w-full text-sm">
                  <p>Discount</p>
                  <p className="text-right">Rp 0</p>
                </div>
                <div className="flex flex-row items-center justify-between w-full text-sm">
                  <p className="font-extrabold">Total Price</p>
                  <p className="text-right">Rp 200.000</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold">My Credit</p>
                <Button className="bg-brand-100 border text-sm border-brand-500 rounded-xl" variant={"secondary"}>
                  Top up Credit
                </Button>
              </div>
              {/* no credit */}
              <div className="bg-[#E3F2DC] min-h-[66px] border border-[#CB8D42]  gap-2 rounded-xl p-4 flex flex-row items-center">
                <CircleInfoSvg />
                <p className="text-sm font-medium text-[#CB8D42]">Oops! You don’t have any credits. Top up to join the class.</p>
              </div>
              <ScrollArea className="w-full  whitespace-nowrap">
                <div className="flex flex-row items-center gap-2">
                  {walletContent?.map((item) => (
                    <CardCreditComponent
                      id={item.id}
                      isActive={selectedCredit == item.id}
                      title={item.title}
                      value={item.value}
                      key={item.id}
                      onClick={() => onSelectWalletCredit(item.id)}
                    />
                  ))}
                </div>

                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <div className="mt-4 flex flex-col gap-2.5 w-full">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="flex flex-row items-center justify-between w-full text-sm">
                  <p>Total Price</p>
                  <p className="text-right">1 Credit</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex w-full p-4">
          <Button className="w-full min-h-[48px]">Process Payment</Button>
        </div>
      </StickyContainerComponent>
    </>
  );
};
