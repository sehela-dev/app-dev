"use client";

import { GeneralTabComponent } from "@/components/general/tabs-component";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetMyCredits } from "@/hooks/api/queries/customer/profile";
import { formatDateHelper } from "@/lib/helper";
import { Clock, GemIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const tabs = [
  {
    name: "Active Credit",
    value: "active",
  },
  {
    name: "Expired Credit",
    value: "expired",
  },
];

export const MyCreditsView = () => {
  const [selecetedTab, setSelectedTab] = useState("active");
  const { data, isLoading, refetch } = useGetMyCredits();

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="My Credit" />

      <div className="flex flex-col gap-4 px-4">
        <div className="mx-auto w-full mt-4">
          <div className="min-h-[181px] flex flex-col w-full  bg-brand-500 border border-brand-500  rounded-[12px] p-4 items-center gap-4 justify-between">
            <p className="text-xl font-semibold text-gray-50">Total Credits</p>
            <div className="flex flex-row items-center gap-1">
              <GemIcon size={24} color="var(--color-gray-50)" />
              <p className="text-[32px] text-gray-50 font-semibold leading-[110%]">21</p>
            </div>
            <p className="text-sm text-gray-50">Active Credits Available</p>
            <div className="flex w-full">
              <Button className="bg-gray-50 w-full text-brand-500">Topup Credit</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="mb-4">
            <GeneralTabComponent
              variant="line"
              tabs={tabs}
              selecetedTab={selecetedTab}
              setTab={(e) => {
                setSelectedTab(e);
                refetch();
              }}
            />
          </div>
          <ScrollArea>
            <div className="flex flex-col gap-4 w-full">
              {(data?.data?.length as number) > 0 ? (
                data?.data?.map((item) => (
                  <MyCreditsCardsItem
                    key={item.package_id}
                    amount={item.total_credits}
                    desc={(item?.class_type_restriction as string) ?? ""}
                    expDate={item?.expires_at}
                  />
                ))
              ) : (
                <EmptyStateCredit />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

interface IProps {
  amount: number;
  expDate: string;
  desc: string;
}

export const MyCreditsCardsItem = ({ amount, expDate, desc }: IProps) => {
  return (
    <div className="bg-brand-00 border border-brand-500 flex flex-col w-full rounded-[12px] p-4 min-h-[104px] gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1 items-center">
          <GemIcon size={18} />
          <p className="font-semibold">{amount} Credit</p>
        </div>
      </div>
      <p>Usable for: {desc ?? ""} </p>
      <div className="flex flex-row items-center w-full justify-between">
        <div className="flex flex-row items-center gap-2">
          <Clock size={16} />
          <p className="text-sm">Expiration Date</p>
        </div>
        <p className="text-sm">{formatDateHelper(expDate, "dd MMM yyyy")}</p>
      </div>
    </div>
  );
};

export const EmptyStateCredit = () => {
  return (
    <div className="w-full mx-auto flex flex-col items-center  min-h-[200px] justify-between">
      <div className="flex">
        <Image src={"/assets/view/gems.png"} alt="no-data" width={160} height={160} />
      </div>
      <div className="flex flex-col gap-2 justify-center items-center text-center">
        <p className="font-semibold">No Credit Available</p>
        <p>Top up now and unlock more learning opportunities!</p>
      </div>
    </div>
  );
};
