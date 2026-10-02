"use client";
import { TransactionVoidDialog } from "@/components/page/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useSendReceiptEmail } from "@/hooks/api/mutations/admin/use-send-receipt-email";

import { useGetOrderDetail } from "@/hooks/api/queries/admin/orders";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatCurrency, formatDateHelper, isTransactionVoidable } from "@/lib/helper";
import { Ban, ExternalLink, Loader2, Mail } from "lucide-react";
import { useParams } from "next/navigation";

import { Fragment, useState } from "react";

export const OrderReceiptPage = () => {
  const { isManager } = useAdminPermission();
  const params = useParams();
  const { id } = params;
  const [openVoid, setOpenVoid] = useState(false);
  const { data, isLoading, refetch } = useGetOrderDetail(id as string);

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
      <Card className="w-full border-brand-100 p-6" id="print_receipt">
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
            {data?.data?.type && (
              <div className="grid grid-cols-2">
                <p className="text-gray-500  text-sm">Type</p>
                <p className="text-brand-999 text-right text-sm capitalize">{data.data.type}</p>
              </div>
            )}
            {data?.data?.branch && (
              <div className="grid grid-cols-2">
                <p className="text-gray-500  text-sm">Branch</p>
                <p className="text-brand-999 text-right text-sm capitalize">{String(data.data.branch).replace(/_/g, " ")}</p>
              </div>
            )}
            {data?.data?.transfer_details?.account_name_from && (
              <div className="grid grid-cols-2">
                <p className="text-gray-500  text-sm">Account Name</p>
                <p className="text-brand-999 text-right text-sm">
                  {data.data.transfer_details.account_name_from}
                  {data.data.transfer_details.account_bank_from ? ` · ${data.data.transfer_details.account_bank_from}` : ""}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Status</p>
              <p
                className={`text-right text-sm capitalize ${
                  data?.data?.status === "paid" ? `text-green-500` : data?.data?.status === "voided" ? "text-violet-800" : `text-red-500`
                }`}
              >
                {data?.data?.status}
              </p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Date</p>
              <p className="text-brand-999 text-right text-sm">{formatDateHelper(data?.data?.date as string, "dd/MM/yyyy")}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Time</p>
              <p className="text-brand-999 text-right text-sm">{data?.data?.time}</p>
            </div>
            {data?.data?.created_by && (
              <div className="grid grid-cols-2">
                <p className="text-gray-500 text-sm">Input</p>
                <p className="text-brand-999 text-right text-sm">
                  <Badge variant="outline" className="text-xs">
                    {data.data.created_by.name ?? data.data.created_by.id.slice(0, 8)}
                  </Badge>
                </p>
              </div>
            )}
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

            {data?.data?.items?.map((item, i) =>
              (item?.booked_for?.length as number) > 0 ? (
                <div key={i}>
                  {" "}
                  <hr style={{ color: "var(--color-brand-100" }} className="my-4" />
                  <div className="grid grid-cols-2">
                    <p className="text-brand-999 font-semibold text-sm">Additional Information</p>
                  </div>
                  {item?.booked_for?.map((d, index) =>
                    index > 0 ? (
                      <div className="grid grid-cols-2 pt-2" key={d?.user_id}>
                        <p className="text-gray-500  text-sm">Customer Name</p>
                        <p className="text-brand-999 text-right text-sm">{d?.name}</p>
                      </div>
                    ) : null,
                  )}
                </div>
              ) : null,
            )}

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
                  <div className="grid grid-cols-2 items-start">
                    <div>
                      <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                      {item.variant && <p className="text-gray-500 font-medium text-sm">{item.variant}</p>}
                      {(item.type || item.session?.place || item.session?.type || item.session?.level) && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {item.type && (
                            <Badge className="rounded-full border-transparent bg-brand-500 px-2 py-px text-[10px] font-semibold capitalize text-white">
                              {item.type}
                            </Badge>
                          )}
                          {item.session?.place && (
                            <Badge variant="outline" className="rounded-full border-brand-200 bg-brand-50 px-2 py-px text-[10px] font-semibold capitalize text-brand-700">
                              {String(item.session.place).replace(/_/g, " ")}
                            </Badge>
                          )}
                          {item.session?.type && (
                            <Badge variant="outline" className="rounded-full px-2 py-px text-[10px] font-semibold capitalize text-gray-600">
                              {String(item.session.type).replace(/_/g, " ")}
                            </Badge>
                          )}
                          {item.session?.level && (
                            <Badge variant="outline" className="rounded-full px-2 py-px text-[10px] font-semibold capitalize text-gray-600">
                              {String(item.session.level).replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.session && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {item.session.id ? (
                            <a
                              href={`/admin/session/${item.session.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
                            >
                              <span>
                                {item.session.class?.class_name ? `[${item.session.class.class_name}] ` : ""}
                                {item.session.session_name}
                              </span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-brand-999">
                              {item.session.class?.class_name ? `[${item.session.class.class_name}] ` : ""}
                              {item.session.session_name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDateHelper(item.session.start_datetime, "EEEE, dd MMM yyyy")} ·{" "}
                            {formatDateHelper(item.session.start_datetime, "HH:mm")} -{" "}
                            {formatDateHelper(item.session.end_datetime, "HH:mm")}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.session.instructor_name}
                            {item.session.place ? ` · ${item.session.place}` : ""}
                          </span>
                        </div>
                      )}
                      {item.booked_for && item.booked_for.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {item.booked_for.map((b) => (
                            <span key={b.user_id} className="text-xs text-gray-500">
                              Booked for:{" "}
                              <a
                                href={`/admin/member/${b.user_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
                              >
                                {b.name}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </span>
                          ))}
                        </div>
                      )}
                      {item.shared_with && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-normal text-gray-500">Shared with: </span>
                          <Badge
                            variant={"secondary"}
                            className="cursor-pointer"
                            onClick={() => {
                              window.open(`/admin/member/${item.shared_with?.user_id}`, "_blank");
                            }}
                          >
                            {item.shared_with.name}
                          </Badge>
                        </div>
                      )}
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
        {isManager && isTransactionVoidable(data?.data?.status) ? (
          <div className="flex w-full">
            <Button
              className="w-full !rounded-[10px]"
              variant={"destructive"}
              onClick={() => {
                // set modal trus for preview void

                setOpenVoid(true);
              }}
            >
              <Ban /> Void Transaction
            </Button>
          </div>
        ) : (
          ""
        )}

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
      {openVoid && (
        <TransactionVoidDialog
          isOpen={openVoid}
          trxId={id as string}
          onClose={() => {
            setOpenVoid(false);
          }}
          refetchOrders={refetch}
        />
      )}
    </div>
  );
};
