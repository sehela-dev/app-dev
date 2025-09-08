import { CircleCheckSvg } from "@/components/asset/svg/CircleCheckSvg";
import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";

import { StickyContainerComponent } from "@/components/layout";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export const CheckoutSummarySessionView = () => {
  return (
    <>
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent title="Summary" />
        <div className="flex w-full px-4 sm:px-8 flex-col gap-4 h-auto  mt-4 overflow-auto">
          <div className="mt-4 flex flex-col gap-2.5 w-full">
            <h3 className="font-semibold">Order Detail</h3>
            <div className="flex flex-row items-center justify-between w-full text-sm">
              <p className="">Order ID</p>
              <p className="text-right">#12314123</p>
            </div>
            <div className="flex flex-row items-center justify-between w-full text-sm">
              <p>Total Price</p>
              <p className="text-right">Rp 200.000</p>
            </div>
          </div>
          <h3 className="font-semibold">Order Items</h3>
          <CheckoutSessionCardComponent duration="20" location="TB Simatupang" date="Monday, 10 Aug 2025" time="08:00" title="Basic Yoga" />
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex w-full p-4">
          <Button className="w-full min-h-[48px]">Process Payment</Button>
        </div>
      </StickyContainerComponent>
    </>
  );
};
