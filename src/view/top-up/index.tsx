"use client";
import { CustomPagination } from "@/components/general/pagination-component";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { CircleChevronRight, GemIcon } from "lucide-react";

export const TopUpCreditPageView = () => {
  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="Top Up Credit" />

      <div className="flex flex-col gap-4 px-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <TopUpCreditItem
            action={() => {}}
            amount="10"
            classType={"Yoga"}
            expiratonDays="30"
            price="200000"
            title="5 Session Package"
            type="offline"
          />
          <TopUpCreditItem
            action={() => {}}
            amount="10"
            classType={"Yoga"}
            expiratonDays="30"
            price="500000"
            title="5 Session Package"
            type="online"
          />
          <TopUpCreditItem
            action={() => {}}
            amount="10"
            classType={"Yoga"}
            expiratonDays="30"
            price="500000"
            title="5 Session Package"
            type="Offline & Online"
          />
          <TopUpCreditItem
            action={() => {}}
            amount="10"
            classType={"Yoga"}
            expiratonDays="30"
            price="500000"
            title="5 Session Package"
            type="Offline & Online"
          />
        </div>
        <div className="text-center">
          <CustomPagination
            onPageChange={(e) => console.log(e)}
            currentPage={1}
            // nextPage={data?.pagination?.}
            hasNextPage={true}
            hasPrevPage={false}
            // previousPage={data?.pagination?.previousPage}
            totalItems={8}
            totalPages={3}
            limit={10}
            position="center"
          />
        </div>
      </div>
    </div>
  );
};

interface IProps {
  title: string;
  amount: string;
  expiratonDays: string;
  classType: string | string[];
  type: string;
  price: string;
  action: () => void;
}

export const TopUpCreditItem = ({ action, amount, classType, expiratonDays, price, title, type }: IProps) => {
  return (
    <div className="bg-brand-500 border border-b-brand-500 rounded-[12px] p-4 h-[236px]">
      <div className="flex flex-col gap-4 ">
        <p className="font-semibold text-xs leading-5 text-gray-200 ">{title}</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2 text-gray-50 font-semibold">
            <GemIcon />
            <p className="leading-4">{amount} Credit</p>
          </div>
          <p className="text-brand-200 text-xs font-semibold">{expiratonDays} Day</p>
        </div>
        <div className="flex flex-col  gap-2 text-gray-50 font-semibold">
          <p className="text-brand-200 text-sm font-medium">{classType}</p>
          <Badge
            variant={"secondary"}
            className={cn("font-medium  text-xs leading-5 rounded-[12px] capitalize bg-[#FDE6FF] border-[#D498D4] text-[#9616A2]", {
              "bg-[#CCE5EA] border-[#98BED4] text-[#165EA2]": type === "online",
              "bg-[#CCEAD7] border-[#98D4AD] text-[#16A249]": type === "offline",
            })}
          >
            {type}
          </Badge>
        </div>
        <Divider color="var(--color-gray-200)" />
        <div className="flex flex-row items-center justify-between">
          <Button variant={"default"} size="icon" onClick={action} className="flex w-full justify-between bg-none">
            <p className="text-brand-50 font-semibold">{formatCurrency(price)}</p>

            <CircleChevronRight color="var(--color-brand-50)" />
          </Button>
        </div>
      </div>
    </div>
  );
};
