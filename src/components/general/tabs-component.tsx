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
    <Tabs defaultValue={selecetedTab} className="w-full">
      <div className="flex w-full flex-row items-center justify-between">
        <TabsList
          variant={variant}
          className={cn("flex w-full items-center gap-2 p-2 duration-300 min-h-[40px]", {
            "bg-brand-50": variant === "default",
          })}
        >
          {tabs?.map((item) => (
            <TabsTrigger
              className={clsx("min-w-[80px] min-h-[32px] cursor-pointer rounded-md p-2 font-medium text-gray-500 duration-300 w-fit px-8", {
                "bg-brand-20 text-brand-999 ": selecetedTab === item.value && variant === "default",
              })}
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
