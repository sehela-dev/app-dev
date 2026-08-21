"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, MapPin, Minus, Plus, TicketPercent, Users, Video, X } from "lucide-react";

import { CircleCheckSvg } from "@/components/asset/svg/CircleCheckSvg";
import { CircleInfoSvg } from "@/components/asset/svg/CircleInfoSvg";
import { CardCreditComponent } from "@/components/general/card-credit";
import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";

import { StickyContainerComponent } from "@/components/layout";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePaymentMethodCtx } from "@/context/payment-method.ctx";
import { useCreateBooking } from "@/hooks/api/mutations/customers";
import { useGetEligibleCredits, useGetMyCredits } from "@/hooks/api/queries/customer/profile";
import { useGetPublicSession } from "@/hooks/api/queries/customer/public";
import { formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { getSessionLevelBadge, getSessionTypeBadge } from "@/utils/session-badge";

type PaymentMethod = "credit" | "cash";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Drop In" },
  { id: "credit", label: "Credit Package(s)" },
];

const getDuration = (start: string, end: string): string => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const total = eh * 60 + em - (sh * 60 + sm);
  return total > 0 ? `${total} min` : "";
};

export const CheckoutSessionView = () => {
  const router = useRouter();
  const { id } = useParams();
  const { paymentType, onChangePaymentMethod } = usePaymentMethodCtx();
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);
  const [creditsToUse, setCreditsToUse] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const { data: session, isLoading, isError } = useGetPublicSession(typeof id === "string" ? id : undefined);
  const { data: creditsData, isLoading: creditsLoading } = useGetMyCredits();
  const eligibleParams = session?.class_id
    ? { class_id: session.class_id, session_type: session.type, place: session.place }
    : undefined;
  const { data: eligibleCreditsData, isLoading: eligibleLoading } = useGetEligibleCredits(eligibleParams);
  const { mutateAsync, isPending: bookingPending } = useCreateBooking();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-4 font-serif text-brand-500">
        <p className="font-semibold">{isError ? "Something went wrong while loading this session." : "Session not found."}</p>
        <p className="text-sm text-brand-500/70">It may have started or is no longer available.</p>
        <Button onClick={() => router.push("/book")}>Back to Book</Button>
      </div>
    );
  }

  const allowCredit = !!session.allow_credit && (session.price_credit_amount ?? 0) > 0;
  const showCredit = paymentType === "credit" && allowCredit;
  const sessionCreditPrice = session.price_credit_amount ?? 1;
  const availableCredits = eligibleParams
    ? (eligibleCreditsData?.data ?? [])
    : (creditsData?.data?.filter((item) => !item.is_expired) ?? []);
  const creditsListLoading = eligibleParams ? eligibleLoading : creditsLoading;
  const selectedPackage = availableCredits.find((item) => item.package_purchase_id === selectedCredit);
  const maxCredits = selectedPackage
    ? Math.max(1, Math.min(sessionCreditPrice, selectedPackage.credits_remaining ?? sessionCreditPrice))
    : sessionCreditPrice;
  const isOnline = session.place === "online";
  const levelBadge = getSessionLevelBadge(session.level);
  const typeBadge = getSessionTypeBadge(session.type);

  const onSelectWalletCredit = (id: string) => {
    const next = selectedCredit === id ? null : id;
    setSelectedCredit(next);
    if (next) {
      const pkg = availableCredits.find((item) => item.package_purchase_id === next);
      setCreditsToUse(Math.min(sessionCreditPrice, pkg?.credits_remaining ?? sessionCreditPrice));
    }
  };

  const handleProcessPayment = async () => {
    if (paymentType === "credit" && selectedCredit) {
      try {
        await mutateAsync({
          class_session_id: session.id,
          payment_method: "credits",
          package_purchase_id: selectedCredit,
          credits_to_use: creditsToUse,
        });
        router.push(`/checkout/${id}/success`);
      } catch {
        // error toast handled by the mutation config; user can retry with another package
      }
    }
  };

  return (
    <>
      <div className="flex flex-col w-full font-serif min-h-full text-brand-500">
        <NavHeaderComponent />
        <div className="flex w-full px-4 flex-col gap-4 mt-4 pb-28">
          <h3 className="font-semibold">Order Items</h3>
          <CheckoutSessionCardComponent
            time={session.time_start}
            duration={getDuration(session.time_start, session.time_end)}
            title={session.session_name}
            location={session.place === "online" ? "Online" : session.location_name ?? ""}
            date={formatDateHelper(session.start_date, "EEEE, dd MMM yyyy")}
            instructor={session.instructor_name ?? undefined}
          />

          {/* Session details */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Session Details</h3>
            <div className="rounded-xl border border-brand-100 bg-brand-25 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge className={`rounded-full text-xs ${typeBadge.className}`}>{typeBadge.label}</Badge>
                {levelBadge && <Badge className={`rounded-full text-xs ${levelBadge.className}`}>{levelBadge.label}</Badge>}
              </div>

              {session.session_description && (
                <p className="text-sm leading-relaxed text-brand-500/80">{session.session_description}</p>
              )}

              <div className="h-px w-full bg-brand-100" />

              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-brand-500/60">
                    <Users size={14} className="shrink-0" /> Instructor
                  </span>
                  <span className="font-semibold text-right">{session.instructor_name ?? "To be announced"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-brand-500/60">
                    {isOnline ? <Video size={14} className="shrink-0" /> : <MapPin size={14} className="shrink-0" />} Place
                  </span>
                  <span className="font-semibold text-right">{isOnline ? "Online session" : (session.location_name ?? "Offline")}</span>
                </div>
                {!isOnline && session.location_address && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-brand-500/60">
                      <MapPin size={14} className="shrink-0" /> Address
                    </span>
                    <span className="font-semibold text-right">{session.location_address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-brand-500/60">
                    <Users size={14} className="shrink-0" /> Availability
                  </span>
                  <span className="font-semibold text-right">
                    {session.is_full ? "Fully booked" : `${session.slots_available} of ${session.slots_total} seats left`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const disabled = method.id === "credit" && !allowCredit;
                return (
                  <button
                    key={method.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChangePaymentMethod(method.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
                      disabled && "opacity-40 cursor-not-allowed",
                      paymentType === method.id
                        ? "bg-brand-500 border-brand-500 text-gray-50"
                        : "border-brand-100 bg-brand-25 text-brand-500 hover:border-brand-500",
                    )}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {showCredit ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold">My Credit</p>
                <Button
                  className="bg-brand-100 border text-sm border-brand-500 rounded-xl"
                  variant={"secondary"}
                  onClick={() => router.push("/topup-credit")}
                >
                  Top Up Credit
                </Button>
              </div>

              {creditsListLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableCredits.length === 0 ? (
                <div className="bg-[#E3F2DC] min-h-[66px] border border-[#CB8D42] gap-2 rounded-xl p-4 flex flex-row items-center">
                  <CircleInfoSvg />
                  <p className="text-sm font-medium text-[#CB8D42]">Oops! You don’t have any credits. Top up to join the class.</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex flex-row items-center gap-2">
                      {availableCredits.map((item) => {
                        const insufficient = (item.credits_remaining ?? 0) < (session.price_credit_amount ?? 0);
                        return (
                          <CardCreditComponent
                            key={item.package_purchase_id}
                            id={item.package_purchase_id}
                            isActive={selectedCredit === item.package_purchase_id}
                            title={item.package_name}
                            value={item.credits_remaining}
                            expiryDate={item.expires_at ?? undefined}
                            disabled={insufficient}
                            onClick={() => !insufficient && onSelectWalletCredit(item.package_purchase_id)}
                          />
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  {selectedPackage && (
                    <div className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-25 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-brand-500/60">Credits to use</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
                            disabled={creditsToUse <= 1}
                            onClick={() => setCreditsToUse((c) => Math.max(1, c - 1))}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="min-w-[44px] text-center text-base font-bold">{creditsToUse}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
                            disabled={creditsToUse >= maxCredits}
                            onClick={() => setCreditsToUse((c) => Math.min(maxCredits, c + 1))}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-brand-500/70">
                        Using credits from {selectedPackage.package_name} ({selectedPackage.credits_remaining}{" "}
                        remaining).
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2.5 w-full">
                    <h3 className="font-semibold">Order Summary</h3>
                    <div className="flex flex-row items-center justify-between w-full text-sm">
                      <p>Total Price</p>
                      <p className="text-right font-semibold">
                        {selectedPackage ? `${creditsToUse} Credit${creditsToUse > 1 ? "s" : ""}` : `${sessionCreditPrice} Credit`}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Promo Code</h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      className="min-h-[48px] rounded-xl border-brand-100 bg-white pl-10 pr-3"
                      placeholder="Enter promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <TicketPercent size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500/40" />
                  </div>
                  <Button
                    type="button"
                    className="min-h-[48px] rounded-xl bg-brand-500 px-6 text-gray-50"
                    onClick={() => setAppliedCoupon(couponInput.trim() || null)}
                  >
                    Apply
                  </Button>
                </div>

                {appliedCoupon ? (
                  <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-500/40 bg-brand-25 py-3 pl-4 pr-2">
                    <div className="flex items-center gap-3">
                      <CircleCheckSvg />
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold uppercase">{appliedCoupon}</p>
                        <p className="text-xs text-brand-500/60">10% off your booking</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-brand-500/50 transition-colors hover:bg-brand-100 hover:text-brand-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-brand-500/50">Have a promo code? Apply it here before checkout.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="flex flex-col gap-2.5 rounded-xl border border-brand-100 bg-brand-25 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-500/60">Subtotal</span>
                    <span className="font-semibold">Rp {session.price_idr.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-500/60">Discount</span>
                    <span className="font-semibold text-brand-500">Rp 0</span>
                  </div>
                  <div className="h-px w-full bg-brand-100" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-extrabold">Rp {session.price_idr.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-25 p-4">
                <CircleInfoSvg />
                <p className="text-xs leading-relaxed text-brand-500/70">
                  Drop In payment is settled directly at the studio before the class starts. Cash and QRIS are accepted.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <StickyContainerComponent>
        <div className="flex w-full p-4">
          <Button
            className="w-full min-h-[48px]"
            disabled={(showCredit && !selectedCredit) || bookingPending}
            onClick={handleProcessPayment}
          >
            {bookingPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {bookingPending ? "Booking..." : "Process Payment"}
          </Button>
        </div>
      </StickyContainerComponent>
    </>
  );
};