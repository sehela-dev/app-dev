"use client";

import { StickyContainerComponent } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarMinus2, Clock4, Gem, MapPin } from "lucide-react";
import Image from "next/image";
import { usePaymentMethodCtx } from "@/context/payment-method.ctx";
import { useGetSessionDetail } from "@/hooks/api/queries/admin/class-session";
import { useParams, useRouter } from "next/navigation";

export const SessionDetailView = () => {
  const router = useRouter();
  const { id } = useParams();
  const { onChangePaymentMethod } = usePaymentMethodCtx();
  const { data } = useGetSessionDetail(id as string);
  const session = data?.data;
  const isCreditOnly = !!session?.is_credit_only;

  const onCheckoutSession = (data: "credit" | "cash") => {
    if (isCreditOnly && data === "cash") return;
    onChangePaymentMethod(data);
    router.push(`/checkout/${id}`);
  };

  return (
    <>
      <div className="relative flex flex-col w-full gap-8 font-serif mx-auto pt-8  text-brand-500 mb-8">
        <div className="flex w-full px-4 sm:px-8 flex-col gap-8 h-full ">
          <div className="relative w-full  h-full mx-auto">
            {session?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.photo_url} alt={session.session_name} className="w-full h-[225px] object-cover rounded-xl" />
            ) : (
              <Image src="/assets/book-page/yoga-class.png" alt="yoga-class" width={361} height={225} className="w-full h-full" objectFit="fill" />
            )}
          </div>

          {/* title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[32px] font-extrabold leading-[110%]">{session?.session_name ?? "Evening Flow with Sound Healing"}</h2>
              {isCreditOnly ? <Badge className="bg-amber-500 text-white">Credit Only</Badge> : null}
            </div>
            <h4 className="font-semibold leading-[140%]">By {session?.instructor_name ?? "Nanang Purwanto"}</h4>
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
          {isCreditOnly ? (
            <div className="w-full">
              <Button
                className="font-extrabold h-12 w-full !bg-brand-50"
                variant={"secondary"}
                onClick={() => onCheckoutSession("credit")}
              >
                <Gem /> {session?.price_credit_amount ?? 1} Credit
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">This session only accepts credit payment</p>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="w-full">
                <Button
                  className="font-extrabold h-12 w-full !bg-brand-50"
                  variant={"secondary"}
                  onClick={() => {
                    onCheckoutSession("credit");
                  }}
                >
                  <Gem /> {session?.price_credit_amount ?? 1} Credit
                </Button>
              </div>
              <p className="font-normal text-xs">Or</p>
              <div className="w-full">
                <Button
                  className="font-extrabold !text-gray-50 h-12 w-full"
                  onClick={() => {
                    onCheckoutSession("cash");
                  }}
                >
                  Rp. {session?.price_idr?.toLocaleString("id-ID") ?? "200.000"}
                </Button>
              </div>
            </div>
          )}
          <div className="w-full">
            <Button className="font-extrabold !text-gray-50 h-12 w-full">Waiting List</Button>
          </div>
        </div>
      </StickyContainerComponent>
    </>
  );
};
