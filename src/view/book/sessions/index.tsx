import { StickyContainerComponent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CalendarMinus2, Clock4, MapPin, Gem } from "lucide-react";
import Image from "next/image";

export const SessionDetailView = () => {
  return (
    <>
      <div className="relative flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500">
        <div className="flex w-full px-4 sm:px-8 flex-col gap-8 h-full min-h-dvh">
          <div className="relative w-full  h-full mx-auto">
            <Image src="/assets/book-page/yoga-class.png" alt="yoga-class" width={361} height={225} className="w-full h-full" objectFit="fill" />
          </div>

          {/* title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[32px] font-extrabold leading-[110%]">Evening Flow with Sound Healing</h2>
            {/* instructor name */}
            <h4 className="font-semibold leading-[140%]">By Nanang Purwanto</h4>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-extrabold">Date & Place</h3>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <p>TB Simatupang</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock4 size={16} />
                <p>08:00 - 08:20 WIB</p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarMinus2 size={16} />
                <p>Monday, 10 Aug 2025</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-extrabold">Description</h3>
            <p className="font-normal mt-4">
              Our approach is altruistic by nature and we are dedicated to the development of the participant and their future endeavors. OSY sees
              yoga in a healing light that has many forms, and each member of our team is committed to being in service to our students. This is true
              for all of our courses.
            </p>
          </div>
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex flex-col gap-4 p-4 font-serif text-brand-500">
          <Button variant={"ghost"} className="font-semibold w-full min-h-5.5">
            Join Now
          </Button>
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="w-full">
              <Button className="font-extrabold h-12 w-full !bg-brand-50" variant={"secondary"}>
                <Gem /> 1 Credit
              </Button>
            </div>
            <p className="font-normal text-xs">Or</p>
            <div className="w-full">
              <Button className="font-extrabold !text-gray-50 h-12 w-full">Rp. 200.000</Button>
            </div>
          </div>
          {/* is waiting */}
          <div className="w-full">
            <Button className="font-extrabold !text-gray-50 h-12 w-full">Waiting List</Button>
          </div>
        </div>
      </StickyContainerComponent>
    </>
  );
};
