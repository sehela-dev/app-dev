"use client";
import { Gem, MapPin } from "lucide-react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface ISessionCardProps {
  time: string;
  duration: string;
  title: string;
  location: string;
  slot: string;
  isSpecial?: boolean;
  credit: string;
  price: string;
  url: string;
}

export const SessionCardComponent = ({ time, duration, title, location, slot, isSpecial, credit, price, url }: ISessionCardProps) => {
  const onClick = () => {
    console.log(url);
  };
  return (
    <div className="relative w-full">
      <Card className="bg-brand-500 text-gray-50 rounded-xl p-2 min-h-[148px] cursor-pointer hover:shadow-md border-none" onClick={onClick}>
        <div className="flex flex-row items-start gap-2.5 min-h-[138px]">
          <div className="bg-brand-400 min-w-[90px] sm:min-w-[100px] min-h-[132px] rounded-md flex flex-col justify-center items-center ">
            <p className="text-sm">{time} WIB</p>
            <p className="text-sm">{duration} Min</p>
          </div>
          {/* class info */}
          <div className="flex flex-col gap-2.5 p-2">
            {/* title */}
            <p className="font-extrabold">{title}</p>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <MapPin size={14} />
                {location}
              </p>
              <Badge className="bg-brand-400 rounded-full text-sm">{slot} seats left</Badge>
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-50 font-bold flex flex-row items-center gap-2">
                <Gem size={18} /> {credit} Credit
              </p>
              <p className="opacity-[0.7]">Or</p>
              <p className="text-gray-50 font-bold">Rp {price}</p>
            </div>
          </div>
        </div>
      </Card>
      {/* is Special */}
      {isSpecial && (
        <div className="absolute top-0 right-0">
          <Image src="/assets/component/special.png" width={130} height={24} alt="special" objectFit="contain" className="" />
        </div>
      )}
    </div>
  );
};
