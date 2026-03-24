"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { StickyContainerComponent } from "@/components/layout";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { useGetMySessionDetail } from "@/hooks/api/queries/customer/profile";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { Loader2, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";

export const MySessionDetail = () => {
  const params = useParams();
  const { id } = params;
  const { data, isLoading, isFetched } = useGetMySessionDetail(id as string);
  const [open, setOpen] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  return (
    <>
      <div className="text-brand-500">
        <NavHeaderComponent title="My Class" />
      </div>
      <div className="flex flex-col w-full gap-[37px] min-h-screen h-full justify-between font-serif text-brand-500">
        <>
          {!isFetched && isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 px-4">
                <div className="flex flex-col gap-4 w-full mt-4 ">
                  <div className="bg-[#FFFFFFCC] border border-[#91C1CA] mx-auto w-full rounded-[12px]">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs">Name</p>
                          <p className="text-sm font-semibold">{data?.data?.customer_name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs">#Order ID</p>
                          <p className="text-sm font-semibold">#ORDERID</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs">Session</p>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold">{data?.data?.session_name}</p>
                          <p className="text-sm font-semibold">
                            {formatDateHelper?.(data?.data?.start_datetime as string, "EEEE, dd MMM yyyy")} |{" "}
                            {formatDateHelper(data?.data?.start_datetime as string, "H:mm")} -{" "}
                            {formatDateHelper(data?.data?.end_datetime as string, "H:mm")}
                          </p>
                          <p className="text-sm">{data?.data?.location_address}</p>
                        </div>
                      </div>
                      <div>
                        <Button
                          className="w-full"
                          variant={"outline"}
                          onClick={() => {
                            window.open(data?.data?.location_maps_url);
                          }}
                        >
                          <MapPin /> Open Goole Maps
                        </Button>
                      </div>
                      <div className="flex flex-row items-center w-full bg-brand-25 p-2 justify-between">
                        <p className="font-semibold text-sm">Purchase Amount</p>
                        <p className="font-semibold text-sm">{formatCurrency(data?.data?.total_paid_idr)}</p>
                      </div>
                      <p className="text-sm font-normal">*) Show this QR code to the receptionist.</p>
                    </div>
                  </div>
                  <div className="mx-auto w-full flex">
                    <div
                      className="max-w-[203px] h-[203px] p-2 w-full bg-gray-50 rounded-md mx-auto"
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <QRCode style={{ width: "100%", height: "100%" }} value={data?.data?.booking_id as string} />
                      <div
                        className="text-center mt-4 cursor-pointer"
                        onClick={() => {
                          setOpen(true);
                        }}
                      >
                        Tap to zoom
                      </div>
                    </div>
                  </div>
                </div>
                {open && (
                  <BaseDialogComponent isOpen={open} title="" btnConfirm="Close" onConfirm={() => setOpen(false)}>
                    <div className="p-2 w-full bg-gray-50 rounded-md mx-auto ">
                      <QRCode style={{ width: "100%", height: "100%" }} value={data?.data?.booking_id as string} />
                    </div>
                  </BaseDialogComponent>
                )}
              </div>
            </>
          )}
        </>

        {data?.data?.booking_status !== "cancelled" && (
          <StickyContainerComponent>
            <div className="flex my-2 px-4">
              <Button
                variant={"destructive"}
                className="w-full bg-red-200 text-red-800"
                onClick={() => {
                  setOpenCancel(true);
                }}
              >
                Cancel Class
              </Button>
            </div>
          </StickyContainerComponent>
        )}
      </div>
      {openCancel && (
        <BaseDialogComponent
          isOpen={openCancel}
          title="Cancel Class?"
          btnConfirm="Cancel Class"
          onConfirm={() => alert("cancel class")}
          onClose={() => {
            setOpenCancel(false);
          }}
          onCloseText="Keep My Class"
        >
          <p className="text-center font-serif text-brand-500">Are you sure you want to cancel this booking? This action cannot be undone.</p>
        </BaseDialogComponent>
      )}
    </>
  );
};
