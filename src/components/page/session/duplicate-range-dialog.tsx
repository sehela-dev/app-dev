"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDuplicatePreview, useDuplicateRange } from "@/hooks/api/mutations/admin";
import type { IDuplicatePreviewResult, IDuplicateRangeSource, TDuplicateRangeMode } from "@/types/class-sessions.interface";
import { fromLocalInputValue } from "@/utils/session-badge";
import { useState } from "react";
import { toast } from "sonner";

const MODES: { value: TDuplicateRangeMode; label: string; hint: string }[] = [
  { value: "day", label: "Day", hint: "All sessions on one date" },
  { value: "week", label: "Week", hint: "Mon–Sun of the date" },
  { value: "month", label: "Month", hint: "Full month of the date" },
  { value: "custom", label: "Custom", hint: "Up to 31 days" },
];

interface DuplicateRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicated?: () => void;
}

// Preview first (entries + room conflicts), then commit — BE skips conflicting rooms.
export const DuplicateRangeDialog = ({ open, onOpenChange, onDuplicated }: DuplicateRangeDialogProps) => {
  const { mutateAsync: previewAsync, isPending: isPreviewing } = useDuplicatePreview();
  const { mutateAsync: commitAsync, isPending: isCommitting } = useDuplicateRange();
  const [form, setForm] = useState({ mode: "day" as TDuplicateRangeMode, date: "", startDate: "", endDate: "", targetDate: "", isPublished: true, publishAt: "" });
  const [preview, setPreview] = useState<IDuplicatePreviewResult | null>(null);

  const update = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setPreview(null);
  };

  const source = (): IDuplicateRangeSource | null => {
    if (form.mode === "custom") {
      if (!form.startDate || !form.endDate) return null;
      return { mode: "custom", start_date: form.startDate, end_date: form.endDate };
    }
    if (!form.date) return null;
    return { mode: form.mode, date: form.date };
  };

  const valid = !!source() && !!form.targetDate;

  const onPreview = async () => {
    const s = source();
    if (!s || !form.targetDate) {
      toast.error("Pick a source range and a target date", { id: "dup-range", position: "top-center" });
      return;
    }
    try {
      const res = await previewAsync({ source: s, target_date: form.targetDate });
      if (res?.data) setPreview(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onCommit = async () => {
    const s = source();
    if (!s || !form.targetDate) return;
    try {
      const res = await commitAsync({
        source: s,
        target_date: form.targetDate,
        is_published: form.isPublished,
        ...(!form.isPublished && form.publishAt && fromLocalInputValue(form.publishAt) ? { publish_at: fromLocalInputValue(form.publishAt) } : null),
        skip_conflicts: true,
      });
      const summary = res?.data?.summary;
      const errors = res?.data?.errors ?? [];
      if (summary && (summary.failed > 0 || errors.length > 0)) {
        toast.error(`${summary.created}/${summary.total} created${summary.skipped ? `, ${summary.skipped} skipped (room booked)` : ""} — ${errors.map((e) => e.error).join("; ")}`, {
          id: "dup-range",
          position: "top-center",
        });
        return;
      }
      onOpenChange(false);
      setPreview(null);
      onDuplicated?.();
    } catch (error) {
      console.log(error);
    }
  };

  const conflicts = preview?.entries.filter((e) => e.conflict) ?? [];

  return (
    <BaseDialogComponent
      isOpen={open}
      title="Duplicate day / week / month"
      btnConfirm={!preview ? (isPreviewing ? "Checking…" : "Preview") : isCommitting ? "Duplicating…" : `Duplicate ${preview.summary.copies} entries`}
      isDisabled={!valid || isPreviewing || isCommitting}
      onClose={() => {
        onOpenChange(false);
        setPreview(null);
      }}
      onConfirm={!preview ? onPreview : onCommit}
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <Button key={m.value} type="button" variant={form.mode === m.value ? "default" : "outline"} size="sm" onClick={() => update({ mode: m.value })}>
              {m.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{MODES.find((m) => m.value === form.mode)?.hint}. Session times are kept, bookings are not copied.</p>
        {form.mode === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label>From</Label>
              <Input type="date" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>To (max 31 days)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Label>Source date</Label>
            <Input type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Label>Target date</Label>
          <Input type="date" value={form.targetDate} onChange={(e) => update({ targetDate: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update({ isPublished: e.target.checked, ...(e.target.checked ? { publishAt: "" } : null) })}
          />
          Publish immediately (off = draft)
        </label>
        {!form.isPublished && (
          <div className="flex flex-col gap-1">
            <Label>Go live at (optional)</Label>
            <Input type="datetime-local" value={form.publishAt} onChange={(e) => update({ publishAt: e.target.value })} />
          </div>
        )}

        {preview && (
          <div className="flex flex-col gap-2 rounded-xl border border-brand-100 bg-brand-25/50 p-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {preview.summary.total} entries · {preview.source.classes_count} classes
                {(preview.source.blocks_count ?? 0) > 0 ? ` · ${preview.source.blocks_count} time blocks` : ""} → {preview.summary.copies} copies
              </p>
              <Button type="button" variant="ghost" size="sm" className="ml-auto h-auto px-2 py-0.5 text-xs" onClick={() => setPreview(null)}>
                ← Edit
              </Button>
            </div>
            {preview.summary.conflicts > 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
                {preview.summary.conflicts} of {preview.summary.total} would land in a room that is already booked — those will be skipped.
              </p>
            )}
            {conflicts.length > 0 && (
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {conflicts.map((c) => (
                  <p key={c.source_id} className="text-xs text-gray-600">
                    <span className="font-medium">{c.session_name}</span>
                    {c.conflict_with?.kind === "block" ? (
                      <>
                        <span className="text-gray-400"> blocked by </span>
                        {c.conflict_with?.block_title ?? "blocked time"}
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400"> conflicts with </span>
                        {c.conflict_with?.existing_session_name ?? "another session"}
                      </>
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseDialogComponent>
  );
};
