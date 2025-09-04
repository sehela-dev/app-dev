"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ListFilter } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

import { CustomCheckbox } from "./custom-checkbox";
import { useSessionFilterState } from "@/hooks";
import { useState } from "react";

const data = {
  classAvailibility: [
    {
      id: "available",
      name: "Available",
    },
    {
      id: "waiting-list",
      name: "Waiting List",
    },
    {
      id: "full",
      name: "Full Booked",
    },
  ],
  instructors: [
    { id: "sarah-chen", name: "Sarah Chen" },
    { id: "michael-torres", name: "Michael Torres" },
    { id: "jecilyn-omega", name: "Jecilyn Omega" },
    { id: "david-kim", name: "David Kim" },
    { id: "lisa-wang", name: "Lisa Wang" },
  ],
  classTypes: [
    { id: "online", name: "Online" },
    { id: "offline", name: "Offline" },
    { id: "private", name: "Private" },
    { id: "special", name: "Special" },
    { id: "workshop", name: "Workshop" },
  ],
};
interface FilterData {
  availbility: string | string[];
  instructors: string | string[];
  classTypes: string | string[];
}

export function DialogSessionFilter() {
  const [filterData, setFilterData] = useState<FilterData | null>(null);

  const { classAvailibility, classTypes, instructors, handleChageCheckBox } = useSessionFilterState();

  console.log(classAvailibility, classTypes, instructors);

  const onApply = () => {
    setFilterData({
      availbility: classAvailibility,
      classTypes,
      instructors,
    });
  };

  console.log(filterData);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"outline"} className="min-h-[40px] min-w-[40px] bg-transparent ">
          <ListFilter />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[345px]  bg-brand-50 font-serif text-brand-500">
        <DialogHeader>
          <DialogTitle className="text-left ">Filter</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[55vh]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Class Availability</p>
              <CustomCheckbox
                id="all"
                label="All Class"
                checked={classAvailibility.includes("all")}
                onChange={() => {
                  handleChageCheckBox("availbility", "all");
                }}
              />
              {data?.classAvailibility?.map((item) => (
                <CustomCheckbox
                  key={item.id}
                  id={item.id}
                  label={item.name}
                  checked={classAvailibility.includes(item.id)}
                  onChange={() => {
                    handleChageCheckBox("availbility", item.id);
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Instructor</p>
              <CustomCheckbox
                id="all-instructor"
                label="All Instructor"
                checked={instructors.includes("all")}
                onChange={() => {
                  handleChageCheckBox("instructor", "all");
                }}
              />
              {data?.instructors.map((instructor) => (
                <CustomCheckbox
                  id={instructor.id}
                  key={instructor.id}
                  label={instructor.name}
                  checked={instructors.includes(instructor.id)}
                  onChange={() => {
                    handleChageCheckBox("instructor", instructor.id);
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Class Type</p>
              <CustomCheckbox
                id="all-type"
                label="All Type"
                checked={instructors.includes("all")}
                onChange={() => {
                  handleChageCheckBox("classType", "all");
                }}
              />
              {data?.classTypes.map((type) => (
                <CustomCheckbox
                  id={type.id}
                  key={type.id}
                  label={type.name}
                  checked={classTypes.includes(type.id)}
                  onChange={() => {
                    handleChageCheckBox("classType", type.id);
                  }}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="">
          <div className="flex flex-row w-full gap-2.5">
            <div className="w-full">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full">
                  Reset Filter
                </Button>
              </DialogClose>
            </div>

            <div className="w-full">
              <DialogClose asChild>
                <Button type="button" className="w-full" variant={"default"} onClick={onApply}>
                  Apply
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
