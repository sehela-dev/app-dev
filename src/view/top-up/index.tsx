"use client";
import { InfiniteScroll } from "@/components/base/infinite-scroll";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { useAuthMember } from "@/context/member.ctx";
import { useGetPublicCreditPackagesInfinite } from "@/hooks/api/queries/customer/public";
import { useGetMyCredits } from "@/hooks/api/queries/customer/profile";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import type { ICreditPackageItem } from "@/types/credit-package.interface";
import type { IMyCreditItem } from "@/types/customer-app/my-credit.interface";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;

type GroupKey = "regular" | "private" | "special";
type FilterKey = "all" | GroupKey;

const GROUP_ORDER: GroupKey[] = ["regular", "private", "special"];
const GROUP_META: Record<GroupKey, { title: string; label: string }> = {
  regular: { title: "Regular class", label: "Yoga and Meditation" },
  private: { title: "Private class", label: "One on one" },
  special: { title: "Special program", label: "Curated series" },
};
const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "regular", label: "Regular" },
  { value: "private", label: "Private" },
  { value: "special", label: "Special" },
];

const sessionOf = (it: ICreditPackageItem): string =>
  ((it as unknown as { session_type_restriction?: string | null }).session_type_restriction ?? "all").toLowerCase();

const placeLabel = (place?: string | null) => {
  const p = (place ?? "").toLowerCase();
  if (p === "offline") return "In studio";
  if (p === "online") return "Online";
  return "In studio and online";
};

export const TopUpCreditPageView = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetPublicCreditPackagesInfinite({}, PAGE_SIZE);

  const pages = useMemo(() => data?.pages ?? [], [data]);
  const items = useMemo(() => pages.flatMap((p) => p.data) ?? [], [pages]);
  const pagination = pages[pages.length - 1]?.pagination;
  const totalItems = pagination?.total_items ?? items.length;

  const groups = useMemo(() => {
    const built = GROUP_ORDER.map((key) => ({
      groupKey: key,
      ...GROUP_META[key],
      items: items.filter((it) => {
        const s = sessionOf(it);
        if (key === "regular") return s === "all" || s === "regular";
        return s === key;
      }),
    })).filter((g) => g.items.length > 0);
    if (built.length === 0 && items.length > 0) {
      return [{ groupKey: "regular" as GroupKey, ...GROUP_META.regular, items }];
    }
    return built;
  }, [items]);

  const visibleGroups = activeFilter === "all" ? groups : groups.filter((g) => g.groupKey === activeFilter);
  const open = (id: string) => router.push(`/topup-credit/${id}`);

  return (
    <div className="flex h-full w-full flex-col font-serif text-brand-900">
      <NavHeaderComponent title="Top Up Credit" />

      <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
        <BalancePanel />

        <div className="sticky top-0 z-10 -mx-4 bg-brand-50/95 px-4 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter packages">
            {FILTERS.map((f) => {
              const active = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveFilter(f.value)}
                  className={
                    active
                      ? "min-h-11 flex-none rounded-full bg-brand-900 px-4 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      : "min-h-11 flex-none rounded-full border border-brand-200 bg-white px-4 text-xs font-bold text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold">Select a package</p>
          <p className="text-[11px] text-gray-500">{totalItems} options</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Loading packages">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="font-semibold">Could not load packages</p>
            <p className="text-sm text-gray-500">Please try again later.</p>
          </div>
        ) : items.length > 0 ? (
          <InfiniteScroll hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={() => fetchNextPage()}>
            <div className="flex flex-col gap-8">
              {visibleGroups.length > 0 ? (
                visibleGroups.map((g) => <PackageSection key={g.groupKey} {...g} onOpen={open} />)
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <p className="font-semibold">No packages in this filter</p>
                  <p className="text-sm text-gray-500">Try another category.</p>
                </div>
              )}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="font-semibold">No credit packages available</p>
            <p className="text-sm text-gray-500">Please check back later.</p>
          </div>
        )}

        <footer className="mt-2 text-center text-[11px] leading-relaxed text-gray-500">
          Both studios, Kemang and Pondok Labu.{" "}
          <button
            type="button"
            className="font-semibold text-brand-700 underline underline-offset-2"
            onClick={() => router.push("/terms-and-conditions")}
          >
            Full credit terms
          </button>
        </footer>
        <div className="pb-2 text-center">
          <Button variant="link" className="text-xs" onClick={() => router.push("/profile/purchase-history")}>
            View purchase history
          </Button>
        </div>
      </div>
    </div>
  );
};

const BalancePanel = () => {
  const { isAuthenticated } = useAuthMember();
  if (!isAuthenticated) return null;
  return <BalancePanelInner />;
};

const BalancePanelInner = () => {
  const { profile } = useAuthMember();
  const { data, isLoading } = useGetMyCredits({ is_expired: false });

  const credits = useMemo(() => data?.data ?? [], [data]);
  // ponytail: client-side expiry sort; push to API ordering if collection grows
  const slides = useMemo(() => {
    const active = credits.filter((c) => !c.is_expired && c.credits_remaining > 0);
    const pool = active.length > 0 ? active : credits;
    return [...pool].sort((a, b) => {
      const ae = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const be = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return ae - be;
    });
  }, [credits]);

  const balance = profile?.overview?.credits_balance ?? credits.reduce((s, c) => s + (c.credits_remaining || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-brand-900 py-8" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      </div>
    );
  }
  if (slides.length === 0) return null;

  return (
    <div className="rounded-3xl bg-brand-900 p-4 text-white shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-100">Credits left</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-5xl font-semibold leading-none">{balance}</span>
          </p>
        </div>
        <p className="pt-1 text-[11px] text-brand-100">
          {slides.length} {slides.length === 1 ? "package" : "packages"} · swipe
        </p>
      </div>
      <div
        className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1"
        role="region"
        aria-roledescription="carousel"
        aria-label="My packages"
      >
        {slides.map((c) => (
          <PackageSlide key={c.package_purchase_id} item={c} />
        ))}
      </div>
    </div>
  );
};

const PackageSlide = ({ item }: { item: IMyCreditItem }) => {
  const total = item.total_credits || 0;
  const used = item.credits_used || 0;
  const remaining = item.credits_remaining || 0;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const daysLeft = item.expires_at
    ? Math.max(0, Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div
      className="min-w-[200px] flex-1 snap-start rounded-2xl bg-white/10 p-3"
      aria-roledescription="slide"
      aria-label={`${item.package_name}, ${remaining} of ${total} credits left`}
    >
      <p className="truncate text-xs font-bold text-white">{item.package_name}</p>
      {!item.is_owner && item.is_shared && (
        <p className="mt-0.5 truncate text-[10px] text-brand-100">
          Shared{item.shared_by_user_name ? ` by ${item.shared_by_user_name}` : ""}
        </p>
      )}
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold leading-none">{remaining}</span>
        <span className="text-[11px] text-brand-100">/ {total} left</span>
      </p>
      <div
        className="mb-1.5 mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] leading-relaxed text-brand-100">
        {item.expires_at ? (
          <>
            Expires <span className="font-bold text-white">{formatDateHelper(item.expires_at, "dd MMM yyyy")}</span>
            {daysLeft !== null && `, ${daysLeft} days left`}
          </>
        ) : (
          <>Starts on first use, {item.validity_days} days</>
        )}
      </p>
    </div>
  );
};

const PackageSection = ({
  label,
  title,
  items,
  onOpen,
}: {
  groupKey: string;
  label: string;
  title: string;
  items: ICreditPackageItem[];
  onOpen: (id: string) => void;
}) => {
  // ponytail: client-side best-value rank + first-timer pin; push to API ordering if catalog grows
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(b.max_purchases_per_user === 1) - Number(a.max_purchases_per_user === 1)),
    [items],
  );
  const { bestId, baseRate } = useMemo(() => {
    let bestRate = Infinity;
    let base = 0;
    let best: ICreditPackageItem | null = null;
    for (const it of items) {
      const credits = Number(it.credits) || 0;
      const price = Number(it.price_idr) || 0;
      if (credits <= 0) continue;
      const rate = price / credits;
      if (rate > base) base = rate;
      if (rate < bestRate) {
        bestRate = rate;
        best = it;
      }
    }
    return { bestId: items.length > 1 && best ? String(best.id) : null, baseRate: base };
  }, [items]);

  return (
    <section aria-label={title} className="flex flex-col">
      <div className="my-3 flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">{label}</span>
        <span className="h-px flex-1 bg-brand-200" aria-hidden="true" />
      </div>
      <h2 className="mb-2 font-serif text-xl font-semibold">
        {title} <span className="ml-1 align-middle font-sans text-[11px] font-normal text-gray-500">{items.length} options</span>
      </h2>
      <div className="flex flex-col gap-2">
        {ordered.map((item) => (
          <PackageRow key={item.id} item={item} isBest={bestId != null && String(item.id) === bestId} baseRate={baseRate} onOpen={onOpen} />
        ))}
      </div>
      <p className="mt-2 max-w-[60ch] text-[11px] leading-relaxed text-gray-500">
        Activate within 30 days of purchase. Once activated, the day count above starts on your first class.
      </p>
    </section>
  );
};

const PackageRow = ({
  item,
  isBest,
  baseRate,
  onOpen,
}: {
  item: ICreditPackageItem;
  isBest: boolean;
  baseRate: number;
  onOpen: (id: string) => void;
}) => {
  const credits = Number(item.credits) || 0;
  const price = Number(item.price_idr) || 0;
  const per = credits > 0 ? Math.round(price / credits) : 0;
  const savePct = credits > 0 && baseRate > 0 ? Math.floor((1 - price / credits / baseRate) * 100) : 0;
  const isFirstTimer = item.max_purchases_per_user === 1;
  const classNames = item.class_ids_restriction?.map((c) => c.name).join(", ");
  const facts: string[] = [];
  if (item.is_shareable) facts.push("Shareable");
  else facts.push("1 person");
  facts.push(`${item.validity_days} days from your first class`);
  facts.push(`${classNames || "All classes"} · ${placeLabel(item.place_restriction)}`);

  return (
    <button
      type="button"
      onClick={() => onOpen(String(item.id))}
      aria-label={`${item.name}, ${item.credits} credits, ${formatCurrency(String(item.price_idr))}${isBest ? ", best value" : ""}${isFirstTimer ? ", first-timers only, one purchase per person" : ""}`}
      className={
        isBest
          ? "w-full rounded-2xl border-2 border-brand-500 bg-brand-25 p-4 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          : "w-full rounded-2xl border border-brand-200 bg-white p-4 text-left transition-shadow hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      }
    >
      <span className="flex items-start justify-between gap-4">
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-serif text-base font-semibold">{item.name}</span>
            {isBest && (
              <span className="rounded-full border border-brand-200 bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
                Best value
              </span>
            )}
            {isFirstTimer && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                First-timers · 1 purchase
              </span>
            )}
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">
            {facts.map((fact, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1 text-gray-300">·</span>}
                {fact.includes("days") ? (
                  <>
                    <span className="font-bold text-brand-900">{fact.split(" ")[0]} days</span> {fact.split(" ").slice(1).join(" ")}
                  </>
                ) : (
                  fact
                )}
              </span>
            ))}
          </span>
        </span>
        <span className="shrink-0 whitespace-nowrap text-right">
          <span className="block text-base font-bold tabular-nums">{formatCurrency(String(item.price_idr))}</span>
          {credits > 1 && <span className="mt-0.5 block text-[11px] tabular-nums text-gray-500">{formatCurrency(String(per))} per class</span>}
          {savePct > 0 && (
            <span className="mt-1 inline-block rounded bg-brand-100 px-1.5 py-0.5 text-[11px] font-bold text-brand-900">
              Save {savePct}%
            </span>
          )}
        </span>
      </span>
      <span className="mt-3 flex items-center justify-end gap-1 text-[11px] font-bold text-brand-700">
        View details <ArrowRight size={14} aria-hidden="true" />
      </span>
    </button>
  );
};
