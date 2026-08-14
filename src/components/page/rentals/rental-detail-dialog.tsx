"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ReturnRentalDialog } from "@/components/page/rentals/return-rental-dialog";
import { RentalReturnHistory } from "@/components/page/rentals/rental-return-history";
import { useGetRentalDetail } from "@/hooks/api/queries/admin/rentals";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { IRentalDetail, IRentalItemLine } from "@/types/rental.interface";
import { MapPin, Package, ReceiptText, UserRound } from "lucide-react";

interface RentalDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "returned":
    case "completed":
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 capitalize">{status}</Badge>;
    case "cancelled":
    case "voided":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 capitalize">{status}</Badge>;
    default:
      return <Badge className="bg-brand-500/10 text-brand-500 border-brand-500/20 capitalize">{status ?? "active"}</Badge>;
  }
};

export const RentalDetailDialog = ({ isOpen, onClose, rentalId }: RentalDetailDialogProps) => {
  const { data, isLoading, refetch } = useGetRentalDetail(rentalId);
  const [openReturn, setOpenReturn] = useState(false);

  const rental = data?.data as IRentalDetail | undefined;

  const items = (rental?.items ?? []) as IRentalItemLine[];

  const hasPendingReturn = items.some((item) => (item.quantity_rented ?? 0) - (item.quantity_returned ?? 0) > 0);
  const totalRented = items.reduce((sum, item) => sum + (item.quantity_rented ?? 0), 0);
  const totalReturned = items.reduce((sum, item) => sum + (item.quantity_returned ?? 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity_rented ?? 0) * (item.variant?.price_idr ?? item.order_item?.unit_price_idr ?? 0), 0);

  const returnEvents = rental?.return_events ?? [];

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[55vw] max-h-[85vh] overflow-y-auto font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-brand-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package size={20} />
              Rental Detail
            </span>
            {rental ? getStatusBadge(rental.status) : null}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {isLoading || !rental ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading rental detail...</div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 rounded-lg border border-brand-100 p-4">
              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-muted-foreground" />
                <p className="font-medium text-foreground">{rental.customer_name ?? "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Order ID</span>
                  <span className="font-mono">{rental.payment?.order_id ?? "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Payment Provider</span>
                  <span className="capitalize">{rental.payment?.provider ?? "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Location</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-muted-foreground" />
                    {rental.location?.name ?? rental.location?.code ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Fulfillment</span>
                  <span className="capitalize">{rental.order?.fulfillment_status ?? "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Rented At</span>
                  <span>{rental.created_at ? formatDateHelper(rental.created_at, "dd MMM yyyy") : "-"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground flex items-center gap-2">
                <ReceiptText size={16} className="text-muted-foreground" />
                Items
              </p>
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const pending = (item.quantity_rented ?? 0) - (item.quantity_returned ?? 0);
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-brand-100 p-3 text-sm">
                      <div className="flex flex-col">
                        <p className="font-medium text-foreground">{item.variant?.variant_name ?? item.order_item?.variant_name ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.order_item?.product_name ? `${item.order_item.product_name} · ` : ""}
                          {item.variant?.sku ? `SKU: ${item.variant.sku}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-medium text-foreground">
                          {item.quantity_rented ?? 0} pcs
                          {item.variant?.price_idr ? ` · ${formatCurrency(item.variant.price_idr)}` : ""}
                        </p>
                        {item.quantity_returned ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500">returned {item.quantity_returned}</Badge>
                        ) : pending > 0 ? (
                          <Badge variant="secondary" className="text-yellow-600">
                            {pending} pending return
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items.</p>}
              </div>
            </div>

            {returnEvents.length > 0 && <RentalReturnHistory events={returnEvents} items={items} />}

            <Divider />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Rented</span>
                <span>
                  {totalReturned}/{totalRented} pcs returned
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">Total Rental Value</p>
                <p className="font-semibold text-foreground">{formatCurrency(totalValue)}</p>
              </div>
            </div>

            <div className="flex w-full flex-row gap-2.5">
              <div className="w-full">
                <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
              {hasPendingReturn && (
                <div className="w-full">
                  <Button type="button" className="w-full" onClick={() => setOpenReturn(true)}>
                    Mark as Returned
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </AlertDialogContent>

      {openReturn && (
        <ReturnRentalDialog
          isOpen={openReturn}
          onClose={() => setOpenReturn(false)}
          rentalId={rentalId}
          rental={rental}
          onSuccess={() => refetch()}
        />
      )}
    </AlertDialog>
  );
};
