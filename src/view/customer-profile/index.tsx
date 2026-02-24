import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";
import { Divider } from "@/components/ui/divider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const ProfilePageView = () => {
  return (
    <div className="flex flex-col gap-6 mx-auto py-6 w-full font-serif text-brand-500">
      <div className="px-4">
        <h3 className="text-3xl font-extrabold ">Profile</h3>
      </div>
      <Divider color="var(--color-brand-200)" />
      <div className="px-4 flex flex-col w-full">
        <div className="flex flex-row items-end w-full justify-between mb-2">
          <p className="font-extrabold text-xl text-bra">My Class</p>
          <p className="font-semibold">View All</p>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-row items-center gap-2">
            <CheckoutSessionCardComponent duration="20" location="TB Simatupang" date="Monday, 10 Aug 2025" time="08:00" title="Basic Yoga" />
            <CheckoutSessionCardComponent duration="20" location="TB Simatupang" date="Monday, 10 Aug 2025" time="08:00" title="Basic Yoga" />
            <CheckoutSessionCardComponent duration="20" location="TB Simatupang" date="Monday, 10 Aug 2025" time="08:00" title="Basic Yoga" />
          </div>
          <div className="mt-4">
            <ScrollBar orientation="horizontal" />
          </div>
        </ScrollArea>
      </div>
      <div className="px-4 flex flex-col w-full">
        <div className="flex flex-row items-end w-full justify-between mb-2">
          <p className="font-extrabold text-xl text-bra">My Class</p>
          <p className="font-semibold">View All</p>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-row items-center gap-2">
            <CheckoutSessionCardComponent
              duration="20"
              location="TB Simatupang"
              date="Monday, 10 Aug 2025"
              time="08:00"
              title="Basic Yoga"
              isCancelled
            />
            <CheckoutSessionCardComponent
              duration="20"
              location="TB Simatupang"
              date="Monday, 10 Aug 2025"
              time="08:00"
              title="Basic Yoga"
              isCancelled
            />
            <CheckoutSessionCardComponent
              duration="20"
              location="TB Simatupang"
              date="Monday, 10 Aug 2025"
              time="08:00"
              title="Basic Yoga"
              isCancelled
            />
            <CheckoutSessionCardComponent
              duration="20"
              location="TB Simatupang"
              date="Monday, 10 Aug 2025"
              time="08:00"
              title="Basic Yoga"
              isCancelled
            />
          </div>
          <div className="mt-4">
            <ScrollBar orientation="horizontal" />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
