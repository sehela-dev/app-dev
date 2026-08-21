"use client";
import { CalendarMinus, MapPin, User, Clock, CreditCard } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface IMySessionCardProps {
  time: string;
  duration: string;
  title: string;
  location: string;
  date: string;
  instructor?: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  bookingId: string;
  classSessionId: string;
  onClick?: () => void;
}

export const MySessionCardComponent = ({
  time,
  duration,
  title,
  location,
  date,
  instructor,
  bookingStatus,
  paymentStatus,
  paymentMethod,
  bookingId,
  classSessionId,
  onClick,
}: IMySessionCardProps) => {
  const router = useRouter();

  const isPendingPayment = bookingStatus === "pending_payment" || paymentStatus === "pending";
  const isCancelled = bookingStatus === "cancelled" || bookingStatus === "canceled";
  const isConfirmed = bookingStatus === "confirmed" && paymentStatus === "paid";

  const getStatusBadge = () => {
    if (isCancelled) {
      return <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Cancelled</span>;
    }
    if (isPendingPayment) {
      return (
        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="h-3 w-3 animate-pulse" />
          Pending Payment
        </span>
      );
    }
    if (isConfirmed) {
      return <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Confirmed</span>;
    }
    return <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{bookingStatus}</span>;
  };

  const handlePayNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/checkout/${classSessionId}/cash-payment?booking_id=${bookingId}`);
  };

  return (
    <div className="relative w-full">
      <Card
        className={cn("bg-brand-500 text-gray-50 rounded-xl p-2 cursor-pointer hover:shadow-md border-none", {
          "bg-[#A14949]": isCancelled,
          "ring-2 ring-yellow-400": isPendingPayment,
        })}
        onClick={onClick ? onClick : () => { }}
      >
        <div className="flex flex-row items-stretch gap-2.5">
          <div
            className={cn("bg-brand-400 w-[90px] rounded-md flex flex-col justify-center items-center", {
              "bg-[#B45D5D]": isCancelled,
              "bg-yellow-400": isPendingPayment && !isCancelled,
            })}
          >
            <p className="text-sm">{time} WIB</p>
            <p className="text-sm">{duration}</p>
          </div>
          {/* class info */}
          <div className="flex flex-col gap-2.5 px-2 justify-between flex-1">
            {/* title & status */}
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold flex-1">{title}</p>
              {getStatusBadge()}
            </div>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <MapPin size={14} />
                {location}
              </p>
              <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                <CalendarMinus size={14} />
                {date}
              </p>
              {instructor && (
                <p className="flex items-center gap-2 text-sm opacity-[0.7]">
                  <User size={14} />
                  {instructor}
                </p>
              )}
            </div>
            {isPendingPayment && paymentMethod === "cash" && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-2 bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                onClick={handlePayNow}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};