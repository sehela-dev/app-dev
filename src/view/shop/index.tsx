import { ShopCardItem } from "@/components/general/shop-card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ListFilter } from "lucide-react";
import Image from "next/image";

export const ShopPageView = () => {
  return (
    <div className="flex flex-col w-full gap-[37px]">
      <div className="font-serif flex-col mx-auto p-4 w-full ">
        <div className="flex flex-row items-center gap-2">
          <SearchInput className="min-h-[40px] bg-brand-25 border-brand-100 " />
          <Button size={"icon"} variant={"outline"} className="min-h-[40px] min-w-[40px] bg-brand-25 border-brand-100 ">
            <ListFilter color="var(--color-brand-500)" strokeWidth={2} />
          </Button>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center w-full justify-between text-brand-500 mt-2">
            <h3 className="text-xl font-bold leading-[130%]">Sports Wear & Equipment</h3>
            <Button variant={"ghost"} className="text-xs w-fit">
              View All
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.25">
          <ShopCardItem />
          <ShopCardItem />
          <ShopCardItem />
          <ShopCardItem />
        </div>
      </div>
    </div>
  );
};
