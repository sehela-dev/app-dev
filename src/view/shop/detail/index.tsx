"use client";
import { StickyContainerComponent } from "@/components/layout";
import { ProductCategorySection } from "@/components/shop/product-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

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
export const ShopDetailView = () => {
  const [selectedPict, setSelectedPict] = useState(1);

  const [qty, setQty] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVariantOne, setSelectedVariantOne] = useState(1);

  const onSelectPict = (id: number) => {
    setSelectedPict(id);
  };

  const onViewAll = (data: string) => {
    console.log(data);
  };

  const onSelectVariant = (id: number) => {
    setSelectedVariantOne(id);
  };

  const onModifyQty = (type: "+" | "-") => {
    const newQty = type === "+" ? qty + 1 : qty - 1;
    if (newQty < 1) return;
    setQty(newQty);
  };

  return (
    <div className="flex flex-col w-full gap-[37px] min-h-screen h-full justify-between">
      <div className="font-serif flex-col mx-auto p-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="md:max-w-[360px] min-h-[318px] max-h-[318px] w-full h-full bg-gray-300 rounded-md">{selectedPict}</div>
          <div className="flex flex-row gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <div
                className={clsx("md:max-w-[85.75px] w-full min-h-[76px] max-h-[76px] h-full bg-gray-500 rounded-md cursor-pointer", {
                  "outline outline-indigo-400 outline-offset-1": item === selectedPict,
                })}
                key={item}
                onClick={() => onSelectPict(item)}
              >
                item
              </div>
            ))}
          </div>
        </div>
        <p className="text-xl font-bold text-brand-500 mt-4">Premium Yoga Mat Panjang Banget Pokoknya</p>
        <div className="flex flex-row gap-2 items-center">
          <p className="text-xl font-bold text-brand-500">Rp 250.000</p>
          <p className="text-md font-medium text-brand-500 line-through">Rp 550.000</p>
        </div>
        <hr style={{ borderColor: "var(--color-brand-500" }} className="my-4" />

        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-brand-500">Description</p>
          <p className="text-[16px] font-normal text-brand-500">
            Our approach is altruistic by nature and we are dedicated to the development of the participant and their future endeavors. OSY sees yoga
            in a healing light that has many forms, and each member of our team is committed to being in service to our students. This is true for all
            of our courses.
          </p>
        </div>

        <ProductCategorySection title="Related Products" onClickViewAll={() => onViewAll("sport-wear")} />
      </div>

      <Sheet open={openDialog}>
        <SheetContent side="bottom" className="min-h-[30vh] rounded-t-2xl  bg-brand-50 font-serif">
          <SheetHeader hidden>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <div className="px-4 py-5 w-full text-brand-500 ">
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
            </div>
          </div>
          <SheetFooter className="bg-white">
            <div className="flex flex-row gap-4">
              <div className="flex w-full">
                <Button variant={"outline"} className="w-full border border-brand-500 text-brand-500" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
              </div>
              <div className="flex w-full">
                <Button className="w-full">Add to Cart</Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <StickyContainerComponent>
        <div className="flex flex-row p-4 gap-2">
          <Button className="bg-brand-50" onClick={() => setOpenDialog(!openDialog)}>
            <ShoppingCart color="var(--color-brand-500)" />
          </Button>
          <div className="flex w-full">
            <Button className="w-full">Buy</Button>
          </div>
        </div>
      </StickyContainerComponent>
    </div>
  );
};

interface IItemSelection {
  selected: boolean;
  title: string;
  id: number;
  onSelect: () => void;
}
export const ItemSelection = ({ selected, title, onSelect }: IItemSelection) => {
  return (
    <div
      className={cn("flex items-center justify-center border border-brand-500 py-2.5 item w-[80px] rounded-md hover:bg-brand-100 h-[38px]", {
        "bg-brand-100": selected,
      })}
      onClick={onSelect}
    >
      <p className="text-sm">{title}</p>
    </div>
  );
};
