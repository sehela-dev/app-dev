"use client";
import { CustomPagination } from "@/components/general/pagination-component";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/helper";
import { useGetPublicCreditPackagesInfinite } from "@/hooks/api/queries/customer/public";
import { ArrowRight, GemIcon, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 10;

export const TopUpCreditPageView = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetPublicCreditPackagesInfinite(
    {},
    PAGE_SIZE,
  );

  const pages = data?.pages ?? [];
  const items = pages.flatMap((p) => p.data) ?? [];
  const pagination = pages[pages.length - 1]?.pagination;
  const totalPages = pagination?.total_pages ?? 1;
  const totalItems = pagination?.total_items ?? items.length;

  // Keep requested page in sync with loaded infinite pages
  useEffect(() => {
    const loaded = pages.length;
    if (page > loaded && loaded > 0) fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const visibleItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || page !== pages.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, page, pages.length]);

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="Top Up Credit" />

      <div className="flex flex-col gap-4 px-4 mt-4">
        <div className="flex gap-2.5 rounded-2xl border border-brand-100 bg-brand-25 px-3.5 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-brand-500" />
          <p className="text-[11px] leading-relaxed text-brand-900">
            Validity starts on <span className="font-semibold">first use</span> — a package&apos;s day count begins
            when you attend your first class with it, not when you buy.
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {visibleItems.map((item) => (
              <TopUpCreditItem
                key={item.id}
                action={() => router.push(`/topup-credit/${item.id}`)}
                amount={String(item.credits)}
                classType={item.class_ids_restriction?.length > 0 ? item.class_ids_restriction.map((c) => c.name).join(", ") : "All Classes"}
                expiratonDays={String(item.validity_days)}
                price={String(item.price_idr)}
                title={item.name}
                type={item.place_restriction ?? "Offline & Online"}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="font-semibold">No credit packages available</p>
            <p className="text-sm text-gray-500">Please check back later.</p>
          </div>
        )}
        <div ref={sentinelRef} className="min-h-[1px]" />
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <CustomPagination
            onPageChange={(e) => setPage(e)}
            currentPage={page}
            hasNextPage={page < totalPages}
            hasPrevPage={page > 1}
            totalItems={totalItems}
            totalPages={totalPages}
            limit={PAGE_SIZE}
            position="center"
          />
        </div>
        <div className="pb-4 text-center">
          <Button variant="link" className="text-xs" onClick={() => router.push("/profile/purchase-history")}>
            View purchase history
          </Button>
        </div>
      </div>
    </div>
  );
};

interface IProps {
  title: string;
  amount: string;
  expiratonDays: string;
  classType: string | string[];
  type: string;
  price: string;
  action: () => void;
}

export const TopUpCreditItem = ({ action, amount, classType, expiratonDays, price, title, type }: IProps) => {
  return (
    <button
      type="button"
      onClick={action}
      className="flex min-h-[188px] flex-col rounded-2xl border border-brand-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500">
          <GemIcon size={14} className="text-white" />
        </span>
        <p className="truncate text-xs font-medium text-gray-500">{title}</p>
      </div>

      <p className="mt-2.5 text-[22px] font-bold leading-none tracking-tight text-brand-900">
        {amount} <span className="text-xs font-semibold text-brand-500">Credits</span>
      </p>
      <p className="mt-1 text-[11px] text-gray-500">
        {expiratonDays} days <span className="text-gray-400">· from first use</span>
      </p>

      <p className="mt-1 truncate text-[11px] capitalize text-gray-500">
        {[classType, type].filter(Boolean).join(" · ")}
      </p>

      <span className="mt-auto flex items-center justify-between border-t border-brand-50 pt-2.5">
        <span className="text-sm font-bold text-brand-900">{formatCurrency(price)}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500">
          <ArrowRight size={14} className="text-white" />
        </span>
      </span>
    </button>
  );
};
