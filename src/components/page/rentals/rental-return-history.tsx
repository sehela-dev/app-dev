"use client";

import { Badge } from "@/components/ui/badge";
import { formatDateHelper } from "@/lib/helper";
import { IRentalItemLine, IRentalReturnEvent, IRentalReturnItem } from "@/types/rental.interface";

interface RentalReturnHistoryProps {
  events?: IRentalReturnEvent[];
  items?: IRentalItemLine[];
}

const getItemName = (eventItem: IRentalReturnItem, items: IRentalItemLine[] = []) => {
  if (eventItem.variant?.variant_name) return eventItem.variant.variant_name;
  if (eventItem.order_item?.variant_name) return eventItem.order_item.variant_name;
  if (eventItem.order_item?.product_name) return eventItem.order_item.product_name;

  const matched = items.find((item) => item.id === eventItem.rental_item_id || item.id === eventItem.id);
  if (matched?.variant?.variant_name) return matched.variant.variant_name;
  if (matched?.order_item?.variant_name) return matched.order_item.variant_name;
  return matched?.order_item?.product_name ?? "Item";
};

export const RentalReturnHistory = ({ events = [], items = [] }: RentalReturnHistoryProps) => {
  if (events.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-foreground">Return History</p>
      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const eventItems = event.items ?? [];
          const date = event.returned_at ?? event.created_at;
          const note = event.note ?? event.notes;
          return (
            <div key={event.id} className="flex flex-col gap-1 rounded-lg border border-brand-100 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{date ? formatDateHelper(date, "EEEE, dd MMM yyyy, H:mm") : "-"}</p>
              {eventItems.map((item, idx) => (
                <div key={item.id ?? item.rental_item_id ?? `${event.id}-${idx}`} className="flex items-center justify-between">
                  <span className="capitalize">{getItemName(item, items)}</span>
                  <span>
                    {item.quantity ?? 0} pcs
                    {item.condition ? (
                      <Badge variant="secondary" className="ml-1 capitalize">
                        {item.condition}
                      </Badge>
                    ) : null}
                  </span>
                </div>
              ))}
              {note ? <p className="text-xs text-muted-foreground italic">Note: {note}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
