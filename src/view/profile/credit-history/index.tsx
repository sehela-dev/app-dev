"use client";

import { GeneralTabComponent } from "@/components/general/tabs-component";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Badge } from "@/components/ui/badge";
import { useAuthMember } from "@/context/member.ctx";
import { useGetCreditLedgerInfinite } from "@/hooks/api/queries/customer/profile";
import { formatDateHelper } from "@/lib/helper";
import { LedgerEntryType } from "@/types/customer-app/credit-ledger.interface";
import { ArrowDownRight, ArrowUpRight, Clock3, History, Loader2, RefreshCw, Sparkles, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const typeMeta: Record<string, { label: string; icon: typeof History; dot: string; badge: string }> = {
  credit_issue: { label: "Earned", icon: Sparkles, dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200" },
  credit_spend: { label: "Used", icon: ArrowUpRight, dot: "bg-brand-500", badge: "bg-brand-50 text-brand-700 border-brand-100" },
  credit_refund: { label: "Refund", icon: RefreshCw, dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  credit_expired: { label: "Expired", icon: Trash2, dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border-gray-200" },
  adjustment: { label: "Adjustment", icon: ArrowDownRight, dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200" },
};

const tabs = [
  { name: "All", value: "all" },
  { name: "Earned", value: "earned" },
  { name: "Used", value: "used" },
  { name: "Expired", value: "expired" },
];

export const CreditHistoryView = () => {
  const { profile } = useAuthMember();
  const [tab, setTab] = useState("all");
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCreditLedgerInfinite(
    tab === "all" ? {} : { type: tab as "earned" | "used" | "expired" },
    20
  );

  const entries = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const summary = (data?.pages[0] as unknown as { summary?: { earned: number; used: number; expired: number; balance: number } })?.summary;
  const stats = summary ?? { earned: 0, used: 0, expired: 0, balance: profile?.overview?.credits_balance ?? 0 };

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, entries.length, tab]);

  return (
    <div className="flex flex-col w-full font-serif text-brand-500">
      <NavHeaderComponent title="Credit History" />

      <div className="flex flex-col gap-4 px-4 pb-6">
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryCard label="Earned" value={`+${stats.earned}`} sub="issued + refund" tone="green" />
          <SummaryCard label="Used" value={`${stats.used}`} sub="spent" tone="brand" />
          <SummaryCard label="Expired" value={`${stats.expired}`} sub={stats.expired ? "lost" : "none"} tone="gray" />
          <SummaryCard label="Balance" value={`${stats.balance}`} sub="available" tone="neutral" />
        </div>

        <GeneralTabComponent variant="line" tabs={tabs} selecetedTab={tab} setTab={setTab} />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {(error as Error)?.message ?? "Unable to load credit history."}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <History className="text-gray-400" size={20} />
            </div>
            <p className="text-sm font-semibold text-brand-900">No {tab === "all" ? "" : tab} history</p>
            <p className="max-w-[240px] text-xs text-gray-500">{tab === "all" ? "Credit movements will appear here." : `No ${tab} entries.`}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <LedgerRow
                key={e.id}
                entry={e}
                isSelf={e.user_id === (profile as unknown as { id?: string })?.id}
              />
            ))}
            <div ref={sentinelRef} className="flex min-h-[28px] justify-center py-2 text-[11px] text-gray-400">
              {isFetchingNextPage ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more…
                </span>
              ) : hasNextPage ? (
                <span>Scroll for more</span>
              ) : (
                <span>All caught up · {entries.length} entries</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function SummaryCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "green" | "brand" | "gray" | "neutral" }) {
  const toneCls =
    tone === "green"
      ? "bg-green-50 border-green-200 text-green-800"
      : tone === "brand"
        ? "bg-brand-25 border-brand-100 text-brand-800"
        : tone === "gray"
          ? "bg-gray-50 border-gray-200 text-gray-700"
          : "bg-white border-brand-100 text-brand-900";
  return (
    <div className={`flex flex-col gap-1 rounded-2xl border px-3 py-3 ${toneCls}`}>
      <span className="text-[10px] font-semibold tracking-wide opacity-70">{label}</span>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[10px] opacity-60">{sub}</span>
    </div>
  );
}

function LedgerRow({
  entry,
  isSelf,
}: {
  entry: import("@/types/customer-app/credit-ledger.interface").ILedgerEntry;
  isSelf?: boolean;
}) {
  const meta = typeMeta[entry.entry_type] ?? typeMeta.adjustment;
  const Icon = meta.icon;
  const isNeg = entry.amount < 0;
  const isExpired = entry.entry_type === "credit_expired";
  const isAdj = entry.entry_type === "adjustment";
  const sc = entry.shared_context;
  const actorName =
    sc.shared_by_user_id && entry.user_id === sc.shared_by_user_id
      ? sc.shared_by_user_name
      : sc.shared_with_user_id && entry.user_id === sc.shared_with_user_id
        ? sc.shared_with_user_name
        : null;
  const actorLabel = actorName ? actorName.trim() : null;

  return (
    <div
      className={
        isExpired
          ? "flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 opacity-90"
          : isAdj
            ? "flex gap-3 rounded-2xl border border-violet-200 bg-violet-50/40 px-4 py-3 shadow-sm"
            : "flex gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm"
      }
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isExpired ? "bg-gray-200" : isAdj ? (isNeg ? "bg-violet-100" : "bg-violet-600") : isNeg ? "bg-gray-100" : "bg-brand-500"}`}
      >
        <Icon size={14} className={isExpired || isNeg ? (isAdj ? "text-violet-700" : "text-gray-600") : "text-white"} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              <p className="text-xs font-semibold text-brand-900">{meta.label}</p>
              <Badge variant="outline" className={`h-5 rounded-full px-2 text-[10px] font-semibold ${meta.badge}`}>
                {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
              </Badge>
              {sc.is_shared_package && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700">
                  <Users size={10} /> Shared
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-gray-600">{entry.note ?? "—"}</p>
            <p className="truncate text-[11px] text-gray-400">{entry.package_name} · {entry.package_credits} cr pkg</p>
            {sc.is_shared_package && (sc.shared_by_user_name || sc.shared_with_user_name) && (
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-violet-600">
                <Users size={11} /> {sc.shared_by_user_name?.trim() || "Owner"} → {(sc.shared_with_user_name || "").trim() || "shared user"}
                {actorLabel && <span className="text-gray-400">· by {actorLabel}{isSelf ? " (you)" : ""}</span>}
              </p>
            )}
            {!sc.is_shared_package && actorLabel && <p className="text-[11px] text-gray-500">by {actorLabel}{isSelf ? " (you)" : ""}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-sm font-bold leading-none ${isNeg ? (isExpired ? "text-gray-600" : "text-gray-700") : "text-green-700"}`}>{entry.amount > 0 ? `+${entry.amount}` : entry.amount} cr</p>
            {isSelf === false && actorLabel && <p className="mt-1 text-[10px] text-violet-600">by {actorLabel}</p>}
            {isSelf === true && sc.is_shared_package && actorLabel && <p className="mt-1 text-[10px] text-brand-500">you</p>}
          </div>
        </div>
        <div className={`mt-2 flex items-center gap-2 border-t pt-2 text-[11px] text-gray-500 ${isExpired ? "border-gray-200" : isAdj ? "border-violet-100" : "border-brand-50"}`}>
          <Clock3 size={11} className={isExpired ? "text-gray-400" : isAdj ? "text-violet-400" : "text-brand-300"} />
          {formatDateHelper(entry.created_at, "dd MMM yyyy · HH:mm")} WIB
        </div>
      </div>
    </div>
  );
}
