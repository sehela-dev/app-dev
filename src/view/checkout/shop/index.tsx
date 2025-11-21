"use client";
import { CircleCheckSvg } from "@/components/asset/svg/CircleCheckSvg";
import { CircleInfoSvg } from "@/components/asset/svg/CircleInfoSvg";
import { CardCreditComponent } from "@/components/general/card-credit";

import { StickyContainerComponent } from "@/components/layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePaymentMethodCtx } from "@/context/payment-method.ctx";
import { ItemSelection } from "@/view/shop/detail";

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

const sizeOption = [
  {
    id: 1,
    name: "150cm",
  },
  {
    id: 2,
    name: "152cm",
  },
  {
    id: 3,
    name: "153cm",
  },
  {
    id: 4,
    name: "154cm",
  },
];

export const CheckoutShopSessionView = () => {
  const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
  const { paymentType } = usePaymentMethodCtx();

  const [deliveryOption, setDeliveryOption] = useState("pickup");

  const [qty, setQty] = useState(1);

  const [selectedVariantOne, setSelectedVariantOne] = useState(1);

  const onSelectVariant = (id: number) => {
    setSelectedVariantOne(id);
  };

  const onSelectWalletCredit = (id: number) => {
    if (selectedCredit === id) setSelectedCredit(null);
    else setSelectedCredit(id);
  };
  const onModifyQty = (type: "+" | "-") => {
    const newQty = type === "+" ? qty + 1 : qty - 1;
    if (newQty < 1) return;
    setQty(newQty);
  };

  const onSelectDeliveryOption = (e: string) => {
    setDeliveryOption(e);
  };
  return (
    <>
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <div className="flex w-full px-4  flex-col gap-4 h-auto  mt-4 overflow-auto">
          <div className="flex flex-row gap-4 w-full max-h-[106px] h-full ">
            <div className="flex w-[120px] h-[106px] rounded-md bg-gray-200">image</div>
            <div className="flex flex-1 w-full flex-col gap-2">
              <p className="font-extrabold text-wrap">Premium Yoga Mat Panjang Banget Pokoknya</p>
              <p className="font-extrabold text-xl">Rp 250.000</p>
              <p className="text-sm font-semibold">Stock: 84</p>
            </div>
          </div>
          <hr style={{ borderColor: "var(--color-brand-200" }} className="my-4" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold">Size</p>
              <div className="flex flex-row gap-3.75">
                {sizeOption?.map((item) => (
                  <ItemSelection
                    title={item.name}
                    selected={item.id === selectedVariantOne}
                    id={item.id}
                    key={item.id}
                    onSelect={() => onSelectVariant(item.id)}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold">Size</p>
              <div className="flex flex-row gap-3.75">
                {sizeOption?.map((item) => (
                  <ItemSelection
                    title={item.name}
                    selected={item.id === selectedVariantOne}
                    id={item.id}
                    key={item.id}
                    onSelect={() => onSelectVariant(item.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-row justify-between items-center">
              <p className="font-semibold">Quantity</p>
              <div className="flex flex-row gap-2 items-center">
                <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty("-")}>
                  -
                </Button>
                <div className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-md">{qty}</div>

                <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty("+")}>
                  +
                </Button>
              </div>
            </div>
            <hr style={{ borderColor: "var(--color-brand-200" }} className="my-4" />
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-bold">Delivery option</p>
            <RadioGroup defaultValue={deliveryOption}>
              <div className="flex items-center gap-3">
                <div className="border border-brand-500 rounded-md w-full flex flex-row justify-between gap-4 items-center p-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <p className=" font-semibold">Pickup (09.00-17.00 WIB)</p>
                    <p>Jl. Pd. Labu 1 No.8b, RT.3/RW.7, Pd. Labu, Kec. Cilandak, Kota Jakarta Selatan</p>
                  </div>
                  <RadioGroupItem value="pickup" id="pickup" onClick={() => onSelectDeliveryOption("pickup")} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="border border-brand-500 rounded-md w-full flex flex-row justify-between gap-4 items-center p-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <p className=" font-semibold">Sameday</p>
                    <p>Price excludes same-day delivery. Shipping fee is paid in cash to the courier upon delivery.</p>
                  </div>
                  <RadioGroupItem value="sameday" id="sameday" onClick={() => onSelectDeliveryOption("sameday")} />
                </div>
              </div>
            </RadioGroup>
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
          </div>
          <div className="mt-4 flex flex-col gap-2.5 w-full bg-brand-500 text-white p-2 rounded-md">
            <div className="flex flex-row items-center justify-between w-full text-sm">
              <p className="">Sub Total</p>
              <p className="text-right">Rp 200.000</p>
            </div>
            <div className="flex flex-row items-center justify-between w-full text-sm">
              <p>Discount</p>
              <p className="text-right">-Rp 0</p>
            </div>
            <div className="flex flex-row items-center justify-between w-full text-sm">
              <p className="font-extrabold">Total Bill</p>
              <p className="text-right text-xl font-bold">Rp 200.000</p>
            </div>
          </div>
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex w-full p-4 gap-2">
          <div className="flex w-full">
            <Button className="w-full min-h-[40px] text-brand-500" variant={"outline"}>
              Cancel
            </Button>
          </div>
          <div className="flex w-full">
            <Button className="w-full min-h-[40px]">Checkout</Button>
          </div>
        </div>
      </StickyContainerComponent>
    </>
  );
};
