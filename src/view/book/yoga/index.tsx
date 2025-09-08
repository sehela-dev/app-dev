"use client";
import { MainFooterComponent } from "@/components/layout";
import { SessionCardComponent } from "@/components/general/session-card";

import { SearchInput } from "@/components/ui/search-input";

import Image from "next/image";
import { DialogSessionFilter } from "@/components/general/filter-dialog";
// import { useSessionFilterState } from "@/hooks";
import { useSessionFilter } from "@/context/session-filter.ctx";

export const BookYogaClassView = () => {
  const { filterData } = useSessionFilter();

  return (
    <div className="flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500">
      <div className="flex w-full px-4 sm:px-8 flex-col gap-8 h-full min-h-dvh">
        <div className="relative w-full  h-full mx-auto">
          <Image src="/assets/book-page/yoga-class.png" alt="yoga-class" width={361} height={225} className="w-full h-full" objectFit="fill" />
        </div>
        <h2 className="font-serif font-extrabold text-[32px]">Yoga Class</h2>
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xl font-extrabold">Description</h3>
          <p className="font-normal">
            Our approach is altruistic by nature and we are dedicated to the development of the participant and their future endeavors. OSY sees yoga
            in a healing light that has many forms, and each member of our team is committed to being in service to our students. This is true for all
            of our courses.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-extrabold">Upcoming Sessions</h3>
          <div className="flex items-center w-full gap-2.5">
            <SearchInput className="min-h-[40px]" />

            <DialogSessionFilter />
          </div>
          <div className="flex flex-col gap-4">
            {/* replace later */}
            <h3 className="font-[600]">Sunday, 10 August 2025</h3>
            {[1, 2, 3].map((item) => (
              <SessionCardComponent
                credit="1"
                duration="20"
                location="TB Simatupang"
                price="200.000"
                slot="12"
                time="08:00"
                title="Basic Yoga"
                url="/"
                isSpecial={item % 2 === 0}
                key={item}
              />
            ))}
          </div>
        </div>
      </div>
      <MainFooterComponent />
    </div>
  );
};
