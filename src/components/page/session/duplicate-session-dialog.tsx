"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDuplicateSession } from "@/hooks/api/mutations/admin";
import { fromLocalInputValue } from "@/utils/session-badge";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DuplicateSource {
  id: string;
  session_name?: string;
  time_start?: string;
  time_end?: string;
  is_published?: boolean;
}

interface DuplicateSessionDialogProps {
  source: DuplicateSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicated?: () => void;
}

export const DuplicateSessionDialog = ({ source, open, onOpenChange, onDuplicated }: DuplicateSessionDialogProps) => {
  const { mutateAsync, isPending } = useDuplicateSession();
  const [rows, setRows] = useState<{ date: string; time_start: string; time_end: string }[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [publishAt, setPublishAt] = useState("");

  useEffect(() => {
    if (open && source) {
      setIsPublished(source.is_published ?? true);
      setPublishAt("");
      setRows([{ date: "", time_start: source.time_start ?? "10:00", time_end: source.time_end ?? "13:00" }]);
    }
  }, [open, source]);

  if (!source) return null;

  const onConfirm = async () => {
    const dates = rows
      .filter((r) => r.date)
      .slice(0, 50)
      .map((r) =>
        r.time_start === (source.time_start ?? "") && r.time_end === (source.time_end ?? "")
          ? r.date
          : { start_date: r.date, time_start: r.time_start, time_end: r.time_end },
      );
    if (!dates.length) {
      toast.error("Add at least one date", { id: "duplicate", position: "top-center" });
      return;
    }
    try {
      const res = await mutateAsync({
        id: source.id,
        data: {
          dates,
          is_published: isPublished,
          ...(!isPublished && publishAt && fromLocalInputValue(publishAt) ? { publish_at: fromLocalInputValue(publishAt) } : null),
        },
      });
      const summary = res?.data?.summary;
      const errors = res?.data?.errors ?? [];
      if (summary?.failed) {
        toast.error(`${summary.created}/${summary.total_requested} created — ${errors.map((e) => `${e.date}: ${e.error}`).join("; ")}`, {
          id: "duplicate",
          position: "top-center",
        });
        return;
      }
      onOpenChange(false);
      onDuplicated?.();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <BaseDialogComponent
      isOpen={open}
      title={`Duplicate — ${source.session_name ?? ""}`}
      btnConfirm={isPending ? "Duplicating…" : "Duplicate"}
      isDisabled={isPending || !rows.some((r) => r.date)}
      onClose={() => onOpenChange(false)}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Bookings are not copied — new sessions start empty as scheduled.</p>
        {rows.map((row, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={row.date}
                onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}
              />
            </div>
            <div className="flex flex-col gap-1 w-28">
              <Label>Start</Label>
              <Input
                type="time"
                value={row.time_start}
                onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, time_start: e.target.value } : r)))}
              />
            </div>
            <div className="flex flex-col gap-1 w-28">
              <Label>End</Label>
              <Input
                type="time"
                value={row.time_end}
                onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, time_end: e.target.value } : r)))}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))} disabled={rows.length <= 1}>
              <X />
            </Button>
          </div>
        ))}
        {rows.length < 50 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setRows((prev) => [...prev, { date: "", time_start: source.time_start ?? "10:00", time_end: source.time_end ?? "13:00" }])}
          >
            + Add date
          </Button>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => {
              setIsPublished(e.target.checked);
              if (e.target.checked) setPublishAt("");
            }}
          />
          Publish immediately (off = draft)
        </label>
        {!isPublished && (
          <div className="flex flex-col gap-1">
            <Label>Go live at (optional)</Label>
            <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          </div>
        )}
      </div>
    </BaseDialogComponent>
  );
};
