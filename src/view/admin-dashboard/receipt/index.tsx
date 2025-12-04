import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { detailSampleOrder } from "@/constants/sample-data";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { Share, Share2 } from "lucide-react";
import { Fragment } from "react";

export const OrderReceiptPage = () => {
  return (
    <div className="mx-auto max-w-[45vw] w-full">
      <Card className="w-full border-brand-100 p-6">
        <CardHeader className="p-0">
          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-semibold">Transaction Recipt</h3>
            <p className="text-gray-500 text-sm">Your complete payment details are shown below.</p>
          </div>
        </CardHeader>
        <hr style={{ color: "var(--color-brand-100" }} />
        <CardContent className="p-0">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Order Detail</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Order ID</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.orderId}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Payment Method</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder.paymentMethod}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Status</p>
              <p className={`text-right text-sm ${detailSampleOrder?.status ? `text-green-500` : `text-red-500`}`}>{detailSampleOrder?.status}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Date</p>
              <p className="text-brand-999 text-right text-sm">{formatDateHelper(detailSampleOrder?.date as string, "dd/MM/yyyy")}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Time</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.time}</p>
            </div>
            <hr style={{ color: "var(--color-brand-100" }} className="my-4" />
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Customer Information</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Customer</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.name}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Phone</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.phone}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Email</p>
              <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.email}</p>
            </div>
            <hr style={{ color: "var(--color-brand-100" }} className="my-4" />
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Ordered Items</p>
            </div>
            <div className=" flex flex-col gap-2 px-4">
              <div className="grid grid-cols-2">
                <p className="text-gray-500 font-medium text-sm">Item</p>
                <p className="text-gray-500 font-medium text-sm text-right">Price & Qty</p>
              </div>
              <hr style={{ color: "var(--color-brand-100" }} />
              {detailSampleOrder?.items?.map((item) => (
                <Fragment key={item.id}>
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                      <p className="text-gray-500 font-medium text-sm">{item.description}</p>
                    </div>
                    <div className="flex flex-row gap-2 justify-end items-center">
                      {item.badge && (
                        <Badge className="border bg-brand-100 min-w-[18px] h-[18px] text-[10px] border-brand-400 !p-1.5 ">{item.badge}</Badge>
                      )}
                      <div className="flex flex-col justify-center">
                        <p className="text-brand-999 font-medium text-sm text-right">{formatCurrency(item.price)}</p>
                        <p className="text-brand-999 font-medium text-sm text-right">X{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <hr style={{ color: "var(--color-brand-100" }} />
                </Fragment>
              ))}
              <div className="grid grid-cols-2">
                <p className="text-brand-999 font-bold text-sm">Total</p>
                <p className="text-brand-999 font-bold text-sm text-right">{formatCurrency(detailSampleOrder.total)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-row gap-2 pt-4">
        <div className="flex">
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex w-full">
          <Button className="w-full text-brand-999" variant={"secondary"}>
            Export PDF
          </Button>
        </div>
        <div className="flex w-full">
          <Button className="w-full">Print</Button>
        </div>
      </div>
    </div>
  );
};
