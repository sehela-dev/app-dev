"use client";

import { useCart } from "@/context/cart.ctx";
import { useGetPublicProducts } from "@/hooks/api/queries/customer/public";
import { formatCurrency } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PAGE_SIZE = 20;

export const ShopPageView = () => {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetPublicProducts({
    page,
    page_size: PAGE_SIZE,
    q: search || undefined,
  });
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col w-full gap-4 px-4 py-4 font-serif text-brand-500 pb-28">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">Shop</h1>
        <p className="text-sm text-brand-400">Pick your variant and pickup location.</p>
      </div>

      <SearchInput
        className="border-brand-100"
        search={search}
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <ShoppingBag className="text-brand-400" size={22} />
          </div>
          <p className="text-sm font-semibold">No products found</p>
          <p className="max-w-[240px] text-xs text-brand-400">Try another keyword or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => {
            const prices = product.variants.map((v) => v.price_idr);
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const inStock = product.variants.some((v) => v.stock_available > 0);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => router.push(`/shop/${product.id}`)}
                className="flex flex-col overflow-hidden rounded-xl border border-brand-100 bg-brand-25 text-left"
              >
                <div className="relative h-[150px] w-full bg-brand-100">
                  <Image
                    src={product.photos?.[0] || "/assets/shop/example-matt.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 550px) 50vw, 260px"
                    className="object-cover"
                  />
                  {product.is_rentable && (
                    <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Rental
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-2.5">
                  <p className="line-clamp-2 min-h-[38px] text-sm font-semibold">{product.name}</p>
                  <p className="text-sm font-bold">{formatCurrency(minPrice)}</p>
                  <p className={`text-[11px] font-medium ${inStock ? "text-brand-400" : "text-red-500"}`}>
                    {inStock ? `${product.variants.length} variant${product.variants.length > 1 ? "s" : ""}` : "Out of stock"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {(pagination?.total_pages ?? 1) > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={!pagination?.has_prev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-brand-500"
          >
            Previous
          </Button>
          <p className="text-xs text-brand-400">
            Page {pagination?.page ?? page} of {pagination?.total_pages}
          </p>
          <Button
            variant="outline"
            disabled={!pagination?.has_next}
            onClick={() => setPage((p) => p + 1)}
            className="text-brand-500"
          >
            Next
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="fixed bottom-20 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-[518px] -translate-x-1/2 items-center justify-between rounded-xl bg-brand-500 p-4 text-white shadow-lg"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart size={18} /> {items.reduce((n, i) => n + i.quantity, 0)} item(s)
          </span>
          <span className="text-sm font-bold">{formatCurrency(subtotal)}</span>
        </button>
      )}
    </div>
  );
};
