"use client";
import { CircleCheckSvg } from "@/components/asset/svg/CircleCheckSvg";
import { StickyContainerComponent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
const sampleCartData = [
  {
    id: 1,
    checked: true,
    name: "Premium Yoga Mat Panjang Banget Pokoknya",
    variant: [
      {
        name: "Length",
        value: "200cm",
      },
      {
        name: "Color",
        value: "Purple",
      },
    ],
    quantity: 1,
    price: 250000,
    image: "/assets/book-page/ballet-class.png",
  },
  {
    id: 2,
    checked: true,
    name: "Yoga Roller Speeds",
    variant: [
      {
        name: "Size",
        value: "Medium",
      },
      {
        name: "Color",
        value: "Black Mamba",
      },
    ],
    quantity: 1,
    price: 160000,
    image: "/assets/book-page/yoga-class.png",
  },
];
export const CartCheckoutView = () => {
  const router = useRouter();
  const [deliveryOption, setDeliveryOption] = useState("pickup");

  const onSelectDeliveryOption = (e: string) => {
    setDeliveryOption(e);
  };

  const totalPriceFormatted = useMemo(() => {
    const total = sampleCartData.reduce((t, i) => (i.checked ? t + i.price * i.quantity : t), 0);
    return total;
  }, [sampleCartData]);
  return (
    <div className="h-[100vh]">
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <div className="flex w-full px-4  flex-col gap-4 h-auto  mt-4 overflow-auto">
          {sampleCartData?.map((cart) => (
            <div className="flex flex-row items-center w-full" key={cart.id}>
              <div className="flex items-center gap-3 w-full">
                <div className="flex flex-row items-start gap-4 w-full">
                  <div className="flex max-w-[91px] w-full h-[80px]">
                    <Image src={cart.image} alt={cart.name} width={91} height={80} objectFit="contain" className="w-full h-full" />
                  </div>

                  <div className="flex w-full">
                    <div className="flex flex-col w-full gap-2.5 ">
                      <p className="font-extrabold  line-clamp-2 whitespace-normal max-w-[246px]">{cart.name}</p>
                      <div className="flex flex-row items-center w-full justify-between">
                        <p className="text-sm font-semibold text-brand-200">
                          {cart?.variant?.map((v: { name: string; value: string }) => v.value).join(", ")}
                        </p>
                        <p className="text-sm font-semibold text-brand-200">x{cart.quantity}</p>
                      </div>
                      <p className="font-extrabold">
                        {cart.price.toLocaleString("id-ID", {
                          currency: "IDR",
                          style: "currency",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <hr style={{ borderColor: "var(--color-brand-200" }} />

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
          <hr style={{ borderColor: "var(--color-brand-200" }} />
          <div className="bg-brand-500 rounded-md flex w-full justify-between text-white font-semibold p-4">
            <p className="w-full">Total Bill</p>
            <p className="w-full text-right">
              {totalPriceFormatted.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex flex-row p-4 gap-2">
          <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-500 w-full" onClick={() => router.push("/cart")}>
              Cancel
            </Button>
          </div>
          <div className="flex w-full">
            <Button className="w-full" onClick={() => {}}>
              Checkout
            </Button>
          </div>
        </div>
      </StickyContainerComponent>
    </div>
  );
};
