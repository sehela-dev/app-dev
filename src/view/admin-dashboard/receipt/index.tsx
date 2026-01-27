"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useSendReceiptEmail } from "@/hooks/api/mutations/admin/use-send-receipt-email";

import { useGetOrderDetail } from "@/hooks/api/queries/admin/orders";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { Loader2, Mail } from "lucide-react";
import { useParams } from "next/navigation";

import { Fragment } from "react";

export const OrderReceiptPage = () => {
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetOrderDetail(id as string);

  const { mutateAsync, isPending } = useSendReceiptEmail();
  const onSendEmail = async () => {
    try {
      const payload = {
        id: id as string,
        recipient_email: data?.data?.customer_email as string,
      };
      const res = await mutateAsync(payload);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

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
        <CardContent className="p-0 h-full">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Order Detail</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Order ID</p>
              <p className="text-brand-999 text-right text-sm font-bold">{data?.data?.order_id}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Payment Method</p>
              <p className="text-brand-999 text-right text-sm capitalize">{data?.data.payment_method}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Status</p>
              <p className={`text-right text-sm capitalize ${data?.data?.status ? `text-green-500` : `text-red-500`}`}>{data?.data?.status}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Date</p>
              <p className="text-brand-999 text-right text-sm">{formatDateHelper(data?.data?.date as string, "dd/MM/yyyy")}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Time</p>
              <p className="text-brand-999 text-right text-sm">{data?.data?.time}</p>
            </div>
            <hr style={{ color: "var(--color-brand-100" }} className="my-4" />
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Customer Information</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Customer</p>
              <p className="text-brand-999 text-right text-sm">{data?.data?.customer_name}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Phone</p>
              <p className="text-brand-999 text-right text-sm">{data?.data?.customer_phone}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Email</p>
              <p className="text-brand-999 text-right text-sm">{data?.data?.customer_email}</p>
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
              {data?.data?.items?.map((item, id) => (
                <Fragment key={id}>
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                      <p className="text-gray-500 font-medium text-sm">{item.variant}</p>
                    </div>
                    <div className="flex flex-row gap-2 justify-end items-center">
                      {/* {item.badge && (
                        <Badge className="border bg-brand-100 min-w-[18px] h-[18px] text-[10px] border-brand-400 !p-1.5 ">{item.badge}</Badge>
                      )} */}
                      <div className="flex flex-col justify-center">
                        <p className="text-brand-999 font-medium text-sm text-right">{formatCurrency(item.total_price)}</p>
                        <p className="text-brand-999 font-medium text-sm text-right">X{item.qty}</p>
                      </div>
                    </div>
                  </div>
                  <hr style={{ color: "var(--color-brand-100" }} />
                </Fragment>
              ))}

              <div className="grid grid-cols-2">
                <p className="text-brand-999 font-bold text-md">Sub Total</p>
                <p className="text-brand-999 font-bold text-md text-right">{formatCurrency(data?.data.subtotal)}</p>
              </div>
              {data?.data?.voucher?.code && (
                <div className="grid grid-cols-2 items-center">
                  <div className="text-brand-999 font-bold  items-center flex flex-row gap-4">
                    <p className="text-brand-999 font-bold text-md">Discount</p>
                    <Badge variant={"outline"} className="text-sm rounded-xl bg-brand-50 text-brand-600 font-bold">
                      {data?.data?.voucher?.code}
                    </Badge>
                  </div>
                  <p className="text-brand-999 font-semibold text-md text-right"> - {formatCurrency(data?.data?.voucher?.discount_applied)}</p>
                </div>
              )}

              <div className="grid grid-cols-2">
                <p className="text-brand-999 font-bold text-md">Total</p>
                <p className="text-brand-999 font-bold text-md text-right">{formatCurrency(data?.data.total_price)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-row gap-2 pt-4">
        <div className="flex w-full">
          <Button className="w-full !rounded-[10px]" onClick={onSendEmail} disabled={!!isPending}>
            <Mail className="w-4 h-4" /> Send Receipt via Email
          </Button>
        </div>
        {/* <div className="flex w-full">
          <Button className="w-full text-brand-999" variant={"secondary"}>
            Export PDF
          </Button>
        </div>
        <div className="flex w-full">
          <Button className="w-full">Print</Button>
        </div> */}
      </div>
    </div>
  );
};
