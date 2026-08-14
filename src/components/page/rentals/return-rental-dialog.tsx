"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { RentalReturnHistory } from "@/components/page/rentals/rental-return-history";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReturnRental } from "@/hooks/api/mutations/admin/use-return-rental";
import { IRentalDetail, IRentalItemLine } from "@/types/rental.interface";

interface ReturnRentalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string;
  rental?: IRentalDetail;
  onSuccess?: () => void;
}

const getPendingQuantity = (item: IRentalItemLine) => (item.quantity_rented ?? 0) - (item.quantity_returned ?? 0);

export const ReturnRentalDialog = ({ isOpen, onClose, rentalId, rental, onSuccess }: ReturnRentalDialogProps) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useReturnRental();

  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const items = (rental?.items ?? []) as IRentalItemLine[];
  const availableItems = items.filter((item) => getPendingQuantity(item) > 0);
  const isReturned = rental?.status === "returned";

  const handleQuantityChange = (itemId: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const isValidQuantity = (item: IRentalItemLine) => {
    const value = Number(quantities[item.id] ?? 0);
    return value >= 0 && value <= getPendingQuantity(item);
  };

  const hasAnyQuantity = availableItems.some((item) => Number(quantities[item.id] ?? 0) > 0);

  const canSubmit = hasAnyQuantity && availableItems.every(isValidQuantity);

  const buildPayload = () => ({
    items: availableItems
      .map((item) => ({
        rental_item_id: item.id,
        quantity: Number(quantities[item.id] ?? 0),
      }))
      .filter((entry) => entry.quantity > 0),
    ...(note ? { note } : null),
  });

  const reset = () => {
    setQuantities({});
    setNote("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await mutateAsync({
        id: rentalId,
        payload: buildPayload(),
        idempotencyKey: crypto.randomUUID(),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "rentals"] });
      handleClose();
      onSuccess?.();
    } catch {
      // error handled by mutation config
    }
  };

  return (
    <BaseDialogComponent
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleSubmit}
      title="Mark as Returned"
      btnConfirm={isReturned ? "" : isPending ? "Processing..." : "Confirm Return"}
      isDisabled={isReturned || !canSubmit || isPending}
    >
      <div className="flex flex-col gap-4">
        {isReturned ? (
          <RentalReturnHistory events={rental?.return_events} items={items} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Label>Items to Return</Label>
              {availableItems.map((item) => {
                const max = getPendingQuantity(item);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-brand-100 p-3 text-sm">
                    <div className="flex flex-col">
                      <p className="font-medium text-foreground">{item.variant?.variant_name ?? item.order_item?.variant_name ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">max {max}</p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={max}
                      value={quantities[item.id] ?? ""}
                      placeholder="0"
                      className="w-24 text-right"
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </div>
                );
              })}
              {availableItems.length === 0 && <p className="text-sm text-muted-foreground">No pending returns for this rental.</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" rows={3} />
            </div>
          </>
        )}
      </div>
    </BaseDialogComponent>
  );
};
