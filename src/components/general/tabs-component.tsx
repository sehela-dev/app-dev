"use client";
import clsx from "clsx";
import { Tabs, TabsList, tabsListVariants, TabsTrigger } from "../ui/tabs";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";

interface ITabs {
  tabs: TabsItem[];
  selecetedTab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  variant?: "default" | "line";
}

interface TabsItem {
  value: string;
  name: string;
}

export const GeneralTabComponent = ({ tabs, selecetedTab, setTab, variant = "default" }: ITabs) => {
  // const router = useRouter();
  return (
    <Tabs defaultValue={selecetedTab} className="flex w-full">
      <div className="flex  flex-row items-center justify-between overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <TabsList
          variant={variant}
          className={cn(
            "flex min-w-0 flex-nowrap items-center justify-start gap-1 overflow-x-auto p-1 duration-300 min-h-[40px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-px-1",
            {
              "bg-brand-50": variant === "default",
            }
          )}
        >
          {tabs?.map((item) => (
            <TabsTrigger
              className={clsx(
                "shrink-0 grow-0 basis-auto whitespace-nowrap min-w-fit min-h-[32px] cursor-pointer rounded-md p-2 font-medium text-gray-500 duration-300 px-4 !flex-none",
                {
                  "bg-brand-20 text-brand-999 ": selecetedTab === item.value && variant === "default",
                }
              )}
              value={item.value}
              key={item.value}
              onClick={() => {
                setTab(item.value);
                // router.push(`?tabs=${item.value}`);
              }}
            >
              {item.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* <ExportButtonComponent onExport={() => {}} /> */}
      </div>
    </Tabs>
  );
};
