"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { toast } from "sonner";

import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IWaitlistEntry } from "@/types/class-sessions.interface";
import { formatDateHelper } from "@/lib/helper";
import { useGetSessionWaitlist } from "@/hooks/api/queries/admin/class-session";
import { useRemoveWaitlistEntry } from "@/hooks/api/mutations/admin";

export const SessionWaitlistPanel = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const [toRemove, setToRemove] = useState<IWaitlistEntry | null>(null);
  const { data, isLoading } = useGetSessionWaitlist(sessionId);
  const { mutateAsync: removeEntry, isPending: removing } = useRemoveWaitlistEntry();

  const entries = data?.data?.entries ?? [];

  const onConfirmRemove = async () => {
    if (!toRemove) return;
    try {
      await removeEntry({ sessionId, userId: toRemove.user_id });
      toast.success("Member removed from waitlist", { position: "top-center" });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Please try again later.";
      toast.error("Failed to remove member", { description: msg, position: "top-center" });
    } finally {
      setToRemove(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">
        Waitlist ({data?.data?.total ?? 0})
      </h4>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading waitlist…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">No members on the waitlist for this session.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-100 bg-brand-25/40 px-3 py-2"
            >
              <span className="w-5 shrink-0 text-xs text-gray-400 tabular-nums">{i + 1}.</span>
              <button
                type="button"
                onClick={() => router.push(`/admin/member/${entry.user_id}`)}
                className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-999 hover:underline cursor-pointer text-left"
              >
                {entry.full_name ?? "Unknown name"}
              </button>
              {entry.email ? (
                <a
                  href={`mailto:${entry.email}`}
                  className="min-w-0 truncate text-xs text-blue-500 underline"
                >
                  {entry.email}
                </a>
              ) : (
                <span className="text-xs text-gray-500">No email</span>
              )}
              <span className="text-xs text-gray-500 tabular-nums">
                Joined {formatDateHelper(entry.joined_at, "dd MMM HH:mm")}
              </span>
              <Badge
                className={
                  entry.notified_at
                    ? "rounded-full bg-emerald-500/10 text-emerald-700 border-none text-[11px]"
                    : "rounded-full bg-gray-500/10 text-gray-600 border-none text-[11px]"
                }
              >
                {entry.notified_at ? (
                  <>
                    <BellRing className="mr-1 h-3 w-3" /> Notified
                  </>
                ) : (
                  "Not notified"
                )}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-red-500"
                onClick={() => setToRemove(entry)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {toRemove && (
        <BaseDialogConfirmation
          open={!!toRemove}
          image="warning-1"
          title="Remove member from waitlist?"
          subtitle={
            toRemove.email ?? "They will no longer receive slot-opened emails for this session."
          }
          confirmText={removing ? "Removing…" : "Remove"}
          onConfirm={onConfirmRemove}
          onCancel={() => setToRemove(null)}
        />
      )}
    </div>
  );
};
