"use client";

import { CustomPagination } from "@/components/general/pagination-component";
import { CustomTable, buildNumber } from "@/components/general/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useGetAdminProductOrders, useUpdateAdminProductOrder } from "@/hooks/api/queries/admin/product-orders";
import { formatCurrency, formatDateHelper, normalizePhoneNumber } from "@/lib/helper";
import { fulfillmentLabel, fulfillmentStyle } from "@/lib/order-status";
import { IAdminProductOrder, TFulfillmentStatus } from "@/types/customer-app/order.interface";
import { Loader2, MessageCircle, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: TFulfillmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Menunggu diproses" },
  { value: "ready_for_pickup", label: "Siap diambil" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "canceled", label: "Dibatalkan" },
];

const LIMIT = 10;

export const ProductOrdersPageView = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TFulfillmentStatus | "all">("all");
  const [selected, setSelected] = useState<IAdminProductOrder | null>(null);

  const { data, isLoading } = useGetAdminProductOrders({
    page,
    page_size: LIMIT,
    ...(status !== "all" ? { fulfillment_status: status } : null),
  });

  const headers = [
    { id: "order_code", text: "Order Code", value: "order_code" },
    {
      id: "customer",
      text: "Customer",
      value: (row: IAdminProductOrder) => row.customer_name || row.user?.full_name || "-",
    },
    {
      id: "created_at",
      text: "Date",
      value: (row: IAdminProductOrder) => formatDateHelper(row.created_at, "dd MMM yyyy · HH:mm"),
    },
    {
      id: "items",
      text: "Items",
      value: (row: IAdminProductOrder) => String(row.items?.reduce((n, item) => n + item.quantity, 0) ?? 0),
    },
    { id: "total_price_idr", text: "Total", value: (row: IAdminProductOrder) => formatCurrency(row.total_price_idr) },
    {
      id: "delivery_method",
      text: "Delivery",
      value: (row: IAdminProductOrder) => (
        <p className="capitalize">{row.delivery_method === "third_party" ? "Third-party" : "Pickup"}</p>
      ),
    },
    {
      id: "fulfillment_status",
      text: "Status",
      value: (row: IAdminProductOrder) => (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${fulfillmentStyle(row.fulfillment_status)}`}>
          {fulfillmentLabel(row.fulfillment_status)}
        </span>
      ),
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IAdminProductOrder) => (
      <Button variant="outline" onClick={() => setSelected(row)}>
        <Settings2 />
      </Button>
    ),
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Product Orders</h3>
            <p className="text-sm text-gray-500 font-normal">Manage fulfillment, tracking, and shipping emails.</p>
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as TFulfillmentStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={{ text: "No", show: true, render: (_: unknown, idx: number) => buildNumber(idx, LIMIT, page) }}
            isLoading={isLoading}
            actionOptions={actionOptions}
          />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={setPage}
            currentPage={page}
            showTotal
            hasPrevPage={data?.pagination?.has_prev}
            hasNextPage={data?.pagination?.has_next}
            totalItems={data?.pagination?.total_items as number}
            totalPages={data?.pagination?.total_pages as number}
            limit={LIMIT}
          />
        </CardFooter>
      </Card>

      <AdminOrderSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

const AdminOrderSheet = ({ order, onClose }: { order: IAdminProductOrder | null; onClose: () => void }) => {
  const { mutateAsync, isPending } = useUpdateAdminProductOrder();
  const [status, setStatus] = useState<TFulfillmentStatus>("pending");
  const [delivery, setDelivery] = useState<"pickup" | "third_party">("pickup");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  // Reset the form whenever a different order is opened.
  const [lastId, setLastId] = useState<string | null>(null);
  if (order && order.id !== lastId) {
    setLastId(order.id);
    setStatus(order.fulfillment_status);
    setDelivery(order.delivery_method);
    setTrackingNumber(order.tracking_number ?? "");
    setTrackingUrl(order.tracking_url ?? "");
    setNotes(order.notes ?? "");
    setEmailSent(null);
  }

  if (!order) return null;

  const phone = order.customer_phone ?? order.user?.phone ?? "";
  const customerName = order.customer_name ?? order.user?.full_name ?? "Customer";

  const handleSave = async () => {
    try {
      const res = await mutateAsync({
        id: order.id,
        payload: {
          fulfillment_status: status,
          delivery_method: delivery,
          tracking_number: trackingNumber.trim() || null,
          tracking_url: trackingUrl.trim() || null,
        },
      });
      if (res.message) {
        toast.success(res.message);
      } else if (status === "shipped" && res.email_sent === false) {
        toast.warning("Order updated, but the shipping email was not sent.");
      } else {
        toast.success(res.email_sent ? "Order updated and email sent." : "Order updated.");
      }
      setEmailSent(typeof res.email_sent === "boolean" ? res.email_sent : null);
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err?.response?.data?.error?.message || "Failed to update order.");
    }
  };

  const handleWa = () => {
    if (!phone) {
      toast.error("This order has no customer phone number.");
      return;
    }
    const message = `Halo ${customerName}, pesanan ${order.order_code} sudah dikirim.${
      trackingNumber ? ` Resi: ${trackingNumber}.` : ""
    }${trackingUrl ? ` Lacak: ${trackingUrl}` : ""}`;
    window.open(`https://wa.me/${normalizePhoneNumber(phone)}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Sheet open={!!order} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {order.order_code}
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${fulfillmentStyle(order.fulfillment_status)}`}>
              {fulfillmentLabel(order.fulfillment_status)}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-8">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-500">Customer</span>
            <span className="text-right font-medium">{customerName}</span>
            <span className="text-gray-500">Phone</span>
            <span className="text-right font-medium">{phone || "-"}</span>
            <span className="text-gray-500">Email</span>
            <span className="text-right font-medium break-all">{order.customer_email ?? order.user?.email ?? "-"}</span>
            <span className="text-gray-500">Total</span>
            <span className="text-right font-medium">{formatCurrency(order.total_price_idr)}</span>
            <span className="text-gray-500">Payment</span>
            <span className="text-right font-medium capitalize">{order.payment_status}</span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Items</p>
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-gray-500">
                    {item.variant_name} · {formatCurrency(item.unit_price_idr)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.total_price_idr)}</p>
              </div>
            ))}
          </div>

          {order.delivery_method === "third_party" && (
            <div className="flex flex-col gap-1 rounded-lg border border-brand-100 p-3 text-sm">
              <p className="font-semibold">
                <Badge variant="secondary">{order.delivery_method === "third_party" ? "Third-party" : "Pickup"}</Badge>
              </p>
              <p>{order.shipping_recipient_name || "-"}</p>
              <p className="text-xs text-gray-500">{order.shipping_phone || "-"}</p>
              <p className="text-xs text-gray-500">{order.shipping_address || "-"}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label>Order notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Customer notes (read-only)" readOnly className="bg-gray-50" />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-brand-100 p-3">
            <div className="flex flex-col gap-1">
              <Label>Fulfillment status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TFulfillmentStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Delivery method</Label>
              <Select value={delivery} onValueChange={(v) => setDelivery(v as "pickup" | "third_party")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="third_party">Third-party</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Tracking number</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. JNE123" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Tracking URL</Label>
              <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>

          {emailSent !== null && (
            <p className={`text-xs font-medium ${emailSent ? "text-green-600" : "text-amber-600"}`}>
              Shipping email: {emailSent ? "sent" : "not sent"}
            </p>
          )}

          <div className="flex gap-2">
            <Button className="w-full" disabled={isPending} onClick={handleSave}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleWa}>
              <MessageCircle /> WhatsApp
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
