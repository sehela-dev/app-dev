"use client";

import { StickyContainerComponent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart.ctx";
import { formatCurrency } from "@/lib/helper";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const CartView = () => {
  const router = useRouter();
  const { items, isCartReady, updateQuantity, removeItem, subtotal, hasMixedLocations } = useCart();

  if (!isCartReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-between font-serif text-brand-500">
      <div className="flex w-full flex-col gap-4 px-4 py-4">
        <h1 className="text-2xl font-extrabold">Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <ShoppingBag className="text-brand-400" size={22} />
            </div>
            <p className="text-sm font-semibold">Your cart is empty</p>
            <p className="max-w-[240px] text-xs text-brand-400">Browse the shop and add a product to get started.</p>
            <Button className="mt-2" onClick={() => router.push("/shop")}>
              Go to Shop
            </Button>
          </div>
        ) : (
          <>
            {hasMixedLocations && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                Your cart has items from different pickup locations. Please remove items until all share one location.
              </p>
            )}

            {items.map((item) => (
              <div key={`${item.variant_id}-${item.location_id}`} className="flex w-full flex-row items-start gap-3 rounded-xl border border-brand-100 bg-brand-25 p-3">
                <div className="relative h-[80px] w-[91px] shrink-0 overflow-hidden rounded-md bg-brand-100">
                  <Image src={item.photo || "/assets/shop/example-matt.png"} alt={item.product_name} fill sizes="91px" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="line-clamp-2 text-sm font-extrabold">{item.product_name}</p>
                  <p className="text-xs font-semibold text-brand-400">{item.variant_name}</p>
                  <p className="text-xs text-brand-400">Pickup: {item.location_name}</p>
                  <p className="text-sm font-extrabold">{formatCurrency(item.price_idr)}</p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.variant_id, item.location_id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-100">{item.quantity}</div>
                      <Button
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.variant_id, item.location_id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button variant="ghost" className="text-red-500" onClick={() => removeItem(item.variant_id, item.location_id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex w-full justify-between rounded-md bg-brand-500 p-4 font-semibold text-white">
              <p>Total</p>
              <p>{formatCurrency(subtotal)}</p>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <StickyContainerComponent>
          <div className="flex flex-row gap-2 p-4">
            <div className="flex w-full">
              <Button variant="outline" className="w-full text-brand-500" onClick={() => router.push("/shop")}>
                Continue Shopping
              </Button>
            </div>
            <div className="flex w-full">
              <Button className="w-full" disabled={hasMixedLocations} onClick={() => router.push("/cart/checkout")}>
                Checkout
              </Button>
            </div>
          </div>
        </StickyContainerComponent>
      )}
    </div>
  );
};
