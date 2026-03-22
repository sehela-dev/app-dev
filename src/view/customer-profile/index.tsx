"use client";
import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuthMember } from "@/context/member.ctx";
import { useGetMySessions } from "@/hooks/api/queries/customer/profile";
import { formatDateHelper, getDurationInMinutes } from "@/lib/helper";

import { ChevronRight, DiamondIcon, Gem, LogOut, RefreshCcw, ShoppingBag, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const ProfilePageView = () => {
  const { data: upcoming } = useGetMySessions({
    status: "upcoming",
    page: 1,
    limit: 8,
  });
  const { data: cancelled } = useGetMySessions({
    status: "cancelled",
    page: 1,
    limit: 8,
  });

  console.log(upcoming);
  const { logout } = useAuthMember();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 pt-4 mx-auto py-6 w-full font-serif text-brand-500">
      <div className="px-4">
        <h3 className="text-3xl font-extrabold ">Profile</h3>
      </div>
      <Divider color="var(--color-brand-200)" />
      <div className="px-4 flex flex-col w-full">
        <div className="flex flex-row items-end w-full justify-between mb-2">
          <p className="font-extrabold text-xl text-bra">My Class</p>
          <p className="font-semibold text-md">View All</p>
        </div>
        {(upcoming?.data?.length as number) < 0 ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex flex-row items-center gap-2">
              {upcoming?.data?.map((item) => (
                <CheckoutSessionCardComponent
                  key={item.id}
                  duration={getDurationInMinutes(item?.class_session?.start_datetime, item?.class_session?.end_datetime)}
                  location={item?.class_session?.location_address}
                  date={formatDateHelper(item.class_session.start_datetime, "EEEE, MMM yyyy")}
                  time={formatDateHelper(item?.class_session?.start_datetime, "H:mm")}
                  title={item?.class_session?.session_name}
                />
              ))}
            </div>

            <div className="mt-4">
              <ScrollBar orientation="horizontal" />
            </div>
          </ScrollArea>
        ) : (
          <p className="text-brand-400 text-sm">
            You don&apos;t have any classes yet, will be available if there is already a class that you have joined.
          </p>
        )}
      </div>

      {(cancelled?.data?.length as number) > 0 ? (
        <div className="px-4 flex flex-col w-full">
          <div className="flex flex-row  w-full justify-between mb-2 items-center">
            <div className="flex flex-col">
              <p className="font-extrabold text-xl">Cancelled Class</p>
              <p className="font-normal text-xs text-brand-400">All canceled classes will receive 1 credit for the same class.</p>
            </div>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex flex-row items-center gap-2">
              {cancelled?.data?.map((item) => (
                <CheckoutSessionCardComponent
                  key={item.id}
                  duration={getDurationInMinutes(item?.class_session?.start_datetime, item?.class_session?.end_datetime)}
                  location={item?.class_session?.location_address}
                  date={formatDateHelper(item.class_session.start_datetime, "EEEE, MMM yyyy")}
                  time={formatDateHelper(item?.class_session?.start_datetime, "H:mm")}
                  title={item?.class_session?.session_name}
                  isCancelled
                />
              ))}
            </div>
            <div className="mt-4">
              <ScrollBar orientation="horizontal" />
            </div>
          </ScrollArea>
        </div>
      ) : null}

      <div className=" pt-6">
        <div className="flex flex-col gap-2 ">
          <MenuItem icon={<Gem />} name="My Credits" action={() => router.push("/profile/my-credits")} />
          <MenuItem icon={<RefreshCcw />} name="Refunded" action={() => router.push("/profile/purchase-history/refuded")} />
          <MenuItem icon={<ShoppingBag />} name="Purchase History" action={() => router.push("/profile/purchase-history")} />
          <MenuItem icon={<SquarePen />} name="Edit Profile" action={() => router.push("/profile/update")} />
        </div>
        <Divider className="mb-4" />
        <MenuItem icon={<LogOut />} name="Logout" action={() => alert("logout")} />
      </div>
    </div>
  );
};

interface IMenu {
  icon: ReactNode;
  name: string;
  url?: string;
  action?: () => void;
}
export const MenuItem = ({ icon, name, url, action }: IMenu) => {
  return (
    <div className="grid grid-cols-12 gap-4 min-h-[48px] cursor-pointer hover:bg-brand-200 items-center px-4 rounded-sm" onClick={action}>
      <div className="col-span-1">{icon}</div>
      <div className="col-span-8">
        <p className="font-semibold">{name}</p>
      </div>

      <div className="col-span-3">
        <div className="flex justify-end w-full">
          <ChevronRight strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};
