"use client";
import { Gem, MapPin, Users, Video } from "lucide-react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ISessionCardProps {
  time: string;
  duration?: string;
  endTime?: string;
  title: string;
  location: string;
  instructor?: string;
  slot: string;
  isSpecial?: boolean;
  isOnline?: boolean;
  credit: string;
  price: string;
  url: string;
  isCheckout?: boolean;
  onClick?: () => void;
}

const getDurationInMinutes = (start: string, end: string): string => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const total = eh * 60 + em - (sh * 60 + sm);
  return total > 0 ? String(total) : "";
};

export const SessionCardComponent = ({
  time,
  duration,
  endTime,
  title,
  location,
  instructor,
  slot,
  isSpecial,
  isOnline,
  credit,
  price,
  url,
  onClick,
}: ISessionCardProps) => {
  const router = useRouter();
  const durationText = duration ?? (endTime ? getDurationInMinutes(time, endTime) : "");

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (url) router.push(url);
  };

  return (
    <div className="relative w-full">
      <Card
        className="min-h-[150px] rounded-xl border-brand-100 bg-brand-25 p-3 cursor-pointer hover:shadow-md justify-center "
        onClick={handleClick}
      >
        <div className="flex h-full flex-row items-stretch gap-3">
          <div className="flex w-[88px] min-w-[88px] flex-col items-center justify-center gap-1 rounded-lg bg-brand-500 px-2 py-3 text-gray-50">
            <p className="text-sm font-bold whitespace-nowrap">{time} WIB</p>
            {durationText && <p className="text-xs opacity-80">{durationText} min</p>}
          </div>

          {/* session info */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className={cn("font-extrabold text-brand-500 leading-snug line-clamp-2", isSpecial && "pr-14")}>{title}</p>

            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-sm text-brand-500/70 truncate">
                {isOnline ? <Video size={14} className="shrink-0" /> : <MapPin size={14} className="shrink-0" />}
                <span className="truncate">{location}</span>
              </p>
              {instructor && (
                <p className="flex items-center gap-2 text-sm text-brand-500/70 truncate">
                  <Users size={14} className="shrink-0" />
                  <span className="truncate">{instructor}</span>
                </p>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <Badge className="rounded-full border-brand-100 bg-brand-500/10 text-xs text-brand-500">{slot} seats left</Badge>
              <div className="flex items-center justify-end gap-2">
                {credit && (
                  <p className="flex items-center gap-1 text-xs font-bold text-brand-500 whitespace-nowrap">
                    <Gem size={14} /> {credit} Cr
                  </p>
                )}
                {price && <p className="text-sm font-extrabold text-brand-500 whitespace-nowrap">Rp {price}</p>}
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* is Special */}
      {isSpecial && (
        <div className="absolute top-1 right-1 z-10">
          <Image src="/assets/component/special.png" width={80} height={24} alt="special" />
        </div>
      )}
    </div>
  );
};
