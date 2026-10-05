"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSessions } from "@/api-req/class-session";
import { usePublishBatch, usePublishSession } from "@/hooks/api/mutations/admin";
import { useGetSessions } from "@/hooks/api/queries/admin/class-session";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatDateHelper } from "@/lib/helper";
import { formatPublishCountdown, isScheduled } from "@/utils/session-badge";
import { useState } from "react";

interface PendingGoLiveSectionProps {
  startDate?: string;
  endDate?: string;
  onChanged?: () => void;
}

// Drafts waiting to go live, scoped to the calendar's active range.
// Publish-all pages through every draft (100/page) and sends ids chunked at 100.
export const PendingGoLiveSection = ({ startDate, endDate, onChanged }: PendingGoLiveSectionProps) => {
  const { can } = useAdminPermission();
  const { data, isLoading, refetch } = useGetSessions({ page: 1, limit: 100, is_published: false, startDate, endDate });
  const { mutateAsync: publishOne } = usePublishSession();
  const { mutateAsync: publishMany, isPending: isPublishingAll } = usePublishBatch();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  if (!can("session:update")) return null;
  const total = data?.pagination?.total_items ?? 0;
  if (!isLoading && total === 0) return null;

  const refresh = () => {
    refetch();
    onChanged?.();
  };

  const onPublishOne = async (id: string) => {
    try {
      setPublishingId(id);
      await publishOne(id);
      refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setPublishingId(null);
    }
  };

  const onPublishAll = async () => {
    try {
      const ids: string[] = [];
      let page = 1;
      for (;;) {
        const res = await getSessions({ page, limit: 100, is_published: false, startDate, endDate });
        ids.push(...res.data.map((s) => s.id));
        if (!res.pagination?.has_next) break;
        page += 1;
      }
      for (let i = 0; i < ids.length; i += 100) {
        await publishMany({ ids: ids.slice(i, i + 100) });
      }
      refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="border-dashed border-brand-200 w-full">
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg text-brand-999 font-medium">
            Waiting for go-live{total > 0 && <span className="ml-2 rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-semibold text-gray-600">{total} draft{total > 1 ? "s" : ""}</span>}
          </h3>
          <p className="text-sm text-gray-500">These sessions are hidden from public until published</p>
        </div>
        <Button onClick={onPublishAll} disabled={isPublishingAll || total === 0}>
          {isPublishingAll ? "Publishing…" : `Publish all${total > 0 ? ` (${total})` : ""}`}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(data?.data ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-dashed border-brand-200 px-3 py-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{s.session_name}</span>
                  <span className="text-xs text-gray-500 tabular-nums">
                    {formatDateHelper(s.start_date, "dd MMM yyyy")} · {s.time_start} – {s.time_end}
                    {isScheduled(s) ? ` · goes live ${formatPublishCountdown(s.publish_at)}` : ""}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => onPublishOne(s.id)} disabled={publishingId === s.id || isPublishingAll}>
                  {publishingId === s.id ? "Publishing…" : "Publish"}
                </Button>
              </div>
            ))}
            {total > (data?.data?.length ?? 0) && (
              <p className="text-xs text-gray-500">Showing {data?.data?.length} of {total} — Publish all covers the rest.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
