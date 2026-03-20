"use client";
import { CalendarMinus, MapPin } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface ISessionCardProps {
  time: string;
  duration: string;
  title: string;
  location: string;
  date: string;
  isCancelled?: boolean;
}

export const CheckoutSessionCardComponent = ({ time, duration, title, location, date, isCancelled = false }: ISessionCardProps) => {
  return (
    <div className="relative w-full">
      <Card
        className={cn("bg-brand-500 text-gray-50 rounded-xl p-2  cursor-pointer hover:shadow-md border-none", {
          "bg-[#A14949]": isCancelled,
        })}
      >
        <div className="flex flex-row items-start gap-2.5 ">
          <div
            className={cn("bg-brand-400 h-[88px] w-[90px] rounded-md flex flex-col justify-center items-center ", {
              "bg-[#B45D5D]": isCancelled,
            })}
          >
            <p className="text-sm">{time} WIB</p>
            <p className="text-sm">{duration} Min</p>
          </div>
          {/* class info */}
          <div className="flex flex-col gap-2.5 px-2 justify-between">
            {/* title */}
            <p className="font-extrabold">{title}</p>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <MapPin size={14} />
                {location}
              </p>
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <CalendarMinus size={14} />
                {date}
              </p>
            </div>{" "}
          </div>
        </div>
      </Card>
      {/* is Special */}
    </div>
  );
};
