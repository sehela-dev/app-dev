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
  isCheckout?: boolean;
  isCreditOnly?: boolean;
  photoUrl?: string | null;
}

export const SessionCardComponent = ({ time, duration, title, location, slot, isSpecial, credit, price, url, isCreditOnly, photoUrl }: ISessionCardProps) => {
  const onClick = () => {
    console.log(url);
  };
  return (
    <div className="relative w-full">
      <Card className="bg-brand-500 text-gray-50 rounded-xl p-2 min-h-[148px] cursor-pointer hover:shadow-md border-none" onClick={onClick}>
        <div className="flex flex-row items-start gap-2.5 min-h-[138px] max-h-[138px]">
          <div className="bg-brand-400 min-w-[90px] sm:min-w-[100px] min-h-[138px] h-full rounded-md flex flex-col justify-center items-center ">
            <p className="text-sm">{time} WIB</p>
            <p className="text-sm">{duration} Min</p>
          </div>
          {/* class info */}
          <div className="flex flex-col gap-2.5 px-2 min-h-[138px] justify-between">
            {/* title */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-extrabold">{title}</p>
              {isCreditOnly ? <Badge className="bg-amber-500 text-white text-xs">Credit Only</Badge> : null}
            </div>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <MapPin size={14} />
                {location}
              </p>
              <Badge className="bg-brand-400 rounded-full text-sm">{slot} seats left</Badge>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-8 w-8 rounded object-cover" />
              ) : null}
            </div>

            <div className="flex flex-row items-center gap-2">
              <p className="text-gray-50 font-bold flex flex-row items-center gap-2">
                <Gem size={18} /> {credit} Credit
              </p>
              {isCreditOnly ? null : (
                <>
                  <p className="opacity-[0.7]">Or</p>
                  <p className="text-gray-50 font-bold">Rp {price}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
      {/* is Special */}
      {isSpecial && (
        <div className="absolute top-0 right-0">
          <Image src="/assets/component/special.png" width={80} height={24} alt="special" objectFit="cover" className="" />
        </div>
      )}
    </div>
  );
};
