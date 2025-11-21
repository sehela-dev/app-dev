"use client";
import { StickyContainerComponent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

export const CartView = () => {
  const router = useRouter();
  const [cartData, setCartData] = useState(sampleCartData);

  // change qty
  const onModifyQty = (index: number, type: "+" | "-") => {
    console.log(index, type);
    setCartData((prev) =>
      prev.map((item) => {
        if (item.id !== index) return item;

        const newQty = type === "+" ? item.quantity + 1 : item.quantity - 1;
        if (newQty < 1) return item;

        return { ...item, quantity: newQty };
      }),
    );
  };
  // change selected status
  const onToggleChecked = (id: number) => {
    console.log(id);
    setCartData((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const totalPriceFormatted = useMemo(() => {
    const total = cartData.reduce((t, i) => (i.checked ? t + i.price * i.quantity : t), 0);
    return total;
  }, [cartData]);

  return (
    <div className="h-[100vh]">
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <div className="flex w-full px-4  flex-col gap-4 h-auto  mt-4 overflow-auto">
          {/* cart item */}
          {cartData?.map((cart) => (
            <div className="flex flex-row items-center w-full" key={cart.id}>
              <div className="flex items-center gap-3 w-full">
                <Checkbox id="terms" checked={cart.checked} onCheckedChange={() => onToggleChecked(cart.id)} />
                <div className="flex flex-row items-start gap-4 w-full">
                  <>
                    <Image src={cart.image} alt={cart.name} width={91} height={80} />
                  </>

                  <div className="flex w-full">
                    <div className="flex flex-col w-full gap-1.5">
                      <p className="font-extrabold">{cart.name}</p>
                      <div className="flex flex-row items-center w-full justify-between">
                        <p className="text-sm font-semibold text-brand-200 flex-1">
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
                      <div className="flex flex-row gap-2 items-center">
                        <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(cart.id, "-")}>
                          -
                        </Button>
                        <div className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-md">{cart.quantity}</div>

                        <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(cart.id, "+")}>
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {totalPriceFormatted > 0 && (
            <div className="bg-brand-500 rounded-md flex w-full justify-between text-white font-semibold p-4">
              <p className="w-full">Selected Product</p>
              <p className="w-full text-right">
                {totalPriceFormatted.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      <StickyContainerComponent>
        <div className="flex flex-row p-4 gap-2">
          <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-500 w-full" onClick={() => {}}>
              Cancel
            </Button>
          </div>
          <div className="flex w-full">
            <Button className="w-full" onClick={() => router.push("/cart/checkout")}>
              Process Checkout
            </Button>
          </div>
        </div>
      </StickyContainerComponent>
    </div>
  );
};
