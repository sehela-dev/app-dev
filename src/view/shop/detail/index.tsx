"use client";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StickyContainerComponent } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart.ctx";
import { useGetPublicProductDetail } from "@/hooks/api/queries/customer/public";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const ShopDetailView = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: product, isLoading, isError } = useGetPublicProductDetail(id);
  const { items, addItem, clearCart, locationId: cartLocationId } = useCart();

  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [pendingReplace, setPendingReplace] = useState<"cart" | "checkout" | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product?.variants, selectedVariantId],
  );

  const selectedAvailability = useMemo(
    () => selectedVariant?.availability.find((a) => a.location_id === selectedLocationId) ?? null,
    [selectedVariant?.availability, selectedLocationId],
  );

  // Gallery = product photos plus every variant photo, so each variant's picture is visible.
  const photos = useMemo(() => {
    const base = product?.photos?.length ? product.photos : ["/assets/shop/example-matt.png"];
    const variantPhotos = product?.variants.flatMap((v) => v.photos ?? []) ?? [];
    return Array.from(new Set([...base, ...variantPhotos]));
  }, [product]);

  const variantIdByPhoto = useMemo(() => {
    const map = new Map<string, string>();
    product?.variants.forEach((v) => v.photos?.forEach((photo) => map.set(photo, v.id)));
    return map;
  }, [product]);

  // Shared by the strip and the fullscreen viewer: viewing a variant photo selects that variant.
  const selectPhoto = (index: number) => {
    setSelectedPhoto(index);
    const variantId = variantIdByPhoto.get(photos[index]);
    if (variantId) setSelectedVariantId(variantId);
  };

  const stepPhoto = (delta: number) => selectPhoto((selectedPhoto + delta + photos.length) % photos.length);

  useEffect(() => {
    if (!product?.variants.length) return;
    const firstAvailable = product.variants.find((v) => v.stock_available > 0) ?? product.variants[0];
    setSelectedVariantId(firstAvailable.id);
  }, [product?.variants]);

  useEffect(() => {
    if (!selectedVariant) return;
    const firstAvailable = selectedVariant.availability.find((a) => a.stock_available > 0) ?? selectedVariant.availability[0];
    setSelectedLocationId(firstAvailable?.location_id ?? null);
    setQty(1);
    const photoIndex = photos.indexOf(selectedVariant.photos?.[0] ?? "");
    setSelectedPhoto(photoIndex >= 0 ? photoIndex : 0);
  }, [selectedVariant, photos]);

  const maxQty = selectedAvailability?.stock_available ?? 0;

  const buildCartItem = () => {
    if (!product || !selectedVariant || !selectedAvailability) return null;
    return {
      variant_id: selectedVariant.id,
      product_id: product.id,
      product_name: product.name,
      variant_name: selectedVariant.variant_name,
      price_idr: selectedVariant.price_idr,
      quantity: qty,
      location_id: selectedAvailability.location_id,
      location_name: selectedAvailability.location_name,
      photo: selectedVariant.photos?.[0] ?? product.photos?.[0] ?? null,
    };
  };

  const commitAdd = (thenCheckout: boolean) => {
    const item = buildCartItem();
    if (!item) {
      toast.error("Please select a variant and location with stock.");
      return;
    }
    addItem(item);
    if (thenCheckout) router.push("/cart/checkout");
    else toast.success("Added to cart");
  };

  const handleAdd = (thenCheckout: boolean) => {
    if (!buildCartItem()) {
      toast.error("Please select a variant and location with stock.");
      return;
    }
    if (items.length > 0 && cartLocationId && cartLocationId !== selectedLocationId) {
      setPendingReplace(thenCheckout ? "checkout" : "cart");
      return;
    }
    commitAdd(thenCheckout);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center font-serif text-brand-500">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-semibold">Product not available</p>
        <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  const canAdd = !!selectedVariant && !!selectedAvailability && maxQty > 0;

  return (
    <div className="flex min-h-full w-full flex-col justify-between gap-6 font-serif text-brand-500">
      <div className="mx-auto w-full p-4">
        <Button
          variant="ghost"
          className="mb-2 !px-0"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/shop"))}
        >
          <ChevronLeft /> Back
        </Button>

        <div className="flex flex-col gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="View full product image"
                className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-md bg-brand-100"
              >
                <Image src={photos[selectedPhoto]} alt={product.name} fill sizes="550px" className="object-cover" />
              </button>
            </DialogTrigger>
            <DialogContent className="inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-black p-0 sm:max-w-none [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-black/50 [&_[data-slot=dialog-close]]:p-2 [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:opacity-100">
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <DialogDescription className="sr-only">Full product image</DialogDescription>
              <div className="flex h-full min-h-0 flex-col">
                <div
                  className="relative min-h-0 flex-1"
                  onTouchStart={(e) => setSwipeStartX(e.touches[0]?.clientX ?? null)}
                  onTouchCancel={() => setSwipeStartX(null)}
                  onTouchEnd={(e) => {
                    if (swipeStartX === null) return;
                    const delta = (e.changedTouches[0]?.clientX ?? 0) - swipeStartX;
                    if (Math.abs(delta) > 60) stepPhoto(delta < 0 ? 1 : -1);
                    setSwipeStartX(null);
                  }}
                >
                  <Image src={photos[selectedPhoto]} alt={product.name} fill sizes="100vw" className="object-contain" />
                  {selectedVariant && (
                    <p className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-4rem)] truncate rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">
                      {selectedVariant.variant_name}
                    </p>
                  )}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={() => stepPhoto(-1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photo"
                        onClick={() => stepPhoto(1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="flex shrink-0 gap-2 overflow-x-auto p-3">
                    {photos.map((photo, index) => (
                      <button
                        key={photo}
                        type="button"
                        aria-label={`View photo ${index + 1}`}
                        onClick={() => selectPhoto(index)}
                        className={cn("relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded bg-white/10", {
                          "outline outline-2 outline-offset-1 outline-white": index === selectedPhoto,
                        })}
                      >
                        <Image src={photo} alt="" fill sizes="48px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {photos.length > 1 && (
            <div className="flex flex-row flex-wrap gap-1.5">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => selectPhoto(index)}
                  className={cn("relative h-[76px] w-[86px] shrink-0 overflow-hidden rounded-md bg-brand-100", {
                    "outline outline-2 outline-offset-1 outline-brand-500": index === selectedPhoto,
                  })}
                >
                  <Image src={photo} alt="" fill sizes="86px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold">{product.name}</h1>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xl font-bold">{formatCurrency(selectedVariant?.price_idr ?? 0)}</p>
          {product.category?.name && <span className="text-xs font-medium text-brand-400">{product.category.name}</span>}
        </div>

        <hr className="my-4 border-brand-200" />

        <div className="flex flex-col gap-2">
          <p className="text-base font-bold">Variant</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const disabled = variant.stock_available <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    const photoIndex = photos.indexOf(variant.photos?.[0] ?? "");
                    if (photoIndex >= 0) setSelectedPhoto(photoIndex);
                  }}
                  className={cn(
                    "rounded-md border border-brand-500 px-3 py-2 text-sm",
                    selectedVariantId === variant.id && "bg-brand-100 font-semibold",
                    disabled && "cursor-not-allowed border-gray-300 text-gray-400 line-through",
                  )}
                >
                  {variant.variant_name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-base font-bold">Pickup location</p>
          {selectedVariant?.availability.length ? (
            <div className="flex flex-col gap-2">
              {selectedVariant.availability.map((availability) => {
                const disabled = availability.stock_available <= 0;
                return (
                  <button
                    key={availability.location_id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedLocationId(availability.location_id)}
                    className={cn(
                      "flex items-center justify-between rounded-md border border-brand-500 px-3 py-2 text-sm",
                      selectedLocationId === availability.location_id && "bg-brand-100",
                      disabled && "cursor-not-allowed border-gray-300 text-gray-400",
                    )}
                  >
                    <span>{availability.location_name}</span>
                    <span className="text-xs">{disabled ? "Out of stock" : `${availability.stock_available} left`}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-red-500">No pickup location available.</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-bold">Quantity</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 bg-transparent"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus size={14} />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-100">{qty}</div>
            <Button
              variant="outline"
              className="h-8 w-8 bg-transparent"
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {product.description && (
          <>
            <hr className="my-4 border-brand-200" />
            <div className="flex flex-col gap-2">
              <p className="text-base font-bold">Description</p>
              <p className="text-sm font-normal leading-relaxed">{product.description}</p>
            </div>
          </>
        )}
      </div>

      <StickyContainerComponent>
        <div className="flex flex-row gap-2 p-4">
          <div>
            <Button className="bg-brand-50" onClick={() => router.push("/cart")} aria-label="Cart">
              <ShoppingCart color="var(--color-brand-500)" />
            </Button>
          </div>
          <div className="flex-1">

            <Button variant="outline" className="w-full border-brand-500 text-brand-500" disabled={!canAdd} onClick={() => handleAdd(false)}>
              Add to Cart
            </Button>
          </div>
          <div>

            <Button className="w-full" disabled={!canAdd} onClick={() => handleAdd(true)}>
              Buy
            </Button>
          </div>
        </div>
      </StickyContainerComponent>

      <BaseDialogConfirmation
        open={!!pendingReplace}
        image="warning-1"
        title="Start a new cart?"
        subtitle={`Your cart has items for another pickup location. Adding this item will clear the current cart.`}
        cancelText="Cancel"
        confirmText="Replace cart"
        onCancel={() => setPendingReplace(null)}
        onConfirm={() => {
          const thenCheckout = pendingReplace === "checkout";
          clearCart();
          setPendingReplace(null);
          commitAdd(thenCheckout);
        }}
      />
    </div>
  );
};

interface IItemSelection {
  selected: boolean;
  title: string;
  id: number;
  onSelect: () => void;
}

export const ItemSelection = ({ selected, title, onSelect }: IItemSelection) => {
  return (
    <div
      className={cn("flex h-[38px] w-[80px] items-center justify-center rounded-md border border-brand-500 py-2.5 hover:bg-brand-100", {
        "bg-brand-100": selected,
      })}
      onClick={onSelect}
    >
      <p className="text-sm">{title}</p>
    </div>
  );
};
