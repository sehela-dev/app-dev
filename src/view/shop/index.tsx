"use client";

import { ProductCategorySection } from "@/components/shop/product-section";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ListFilter } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const ShopPageView = () => {
  const query = useSearchParams();
  const q = query.get("category") ?? "";
  console.log(q);

  const onViewAll = (category: string) => {
    console.log("ss", category);
    // router.push(`/shop?category=${category}`);
  };

  return (
    <div className="flex flex-col w-full gap-[37px]">
      <div className="font-serif flex-col mx-auto p-4 w-full ">
        <div className="flex flex-row items-center gap-2">
          <SearchInput className="min-h-[40px] bg-brand-25 border-brand-100 " />
          <Button size={"icon"} variant={"outline"} className="min-h-[40px] min-w-[40px] bg-brand-25 border-brand-100 ">
            <ListFilter color="var(--color-brand-500)" strokeWidth={2} />
          </Button>
        </div>

        <ProductCategorySection title="Sports Wear & Equipment" onClickViewAll={() => onViewAll("sport-wear")} />
        <ProductCategorySection title="Merch" onClickViewAll={() => onViewAll("sport-wear")} />
        <ProductCategorySection title="Other" onClickViewAll={() => onViewAll("sport-wear")} />
      </div>
    </div>
  );
};
