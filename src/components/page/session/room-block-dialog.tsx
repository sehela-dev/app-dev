"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateRoomBlock } from "@/hooks/api/mutations/admin";
import { useGetClassRoo } from "@/hooks/api/queries/admin/class-room";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface RoomBlockInitial {
  start_date: string;
  time_start: string;
  time_end: string;
}

interface RoomBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
  initial?: RoomBlockInitial | null;
}

// Time block = room unusable for sessions at that time (no class/price/booking).
export const RoomBlockDialog = ({ open, onOpenChange, onChanged, initial }: RoomBlockDialogProps) => {
  const { mutateAsync, isPending } = useCreateRoomBlock();
  const { data: rooms, isLoading: isLoadingRooms } = useGetClassRoo({ page: 1, limit: 100 });
  const [form, setForm] = useState({ room_id: "", title: "", reason: "", start_date: "", time_start: "10:00", time_end: "13:00" });

  useEffect(() => {
    if (open && initial) setForm((f) => ({ ...f, ...initial }));
  }, [open, initial]);

  const valid = form.room_id && form.title.trim() && form.start_date && form.time_start && form.time_end;

  const onConfirm = async () => {
    if (!valid) return;
    if (form.time_end <= form.time_start) {
      toast.error("End time must be after start time", { id: "room-block", position: "top-center" });
      return;
    }
    try {
      const res = await mutateAsync({
        room_id: form.room_id,
        title: form.title.trim(),
        ...(form.reason.trim() ? { reason: form.reason.trim() } : null),
        start_date: form.start_date,
        time_start: form.time_start,
        time_end: form.time_end,
      });
      if (res) {
        onOpenChange(false);
        onChanged?.();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <BaseDialogComponent
      isOpen={open}
      title="Block room time"
      btnConfirm={isPending ? "Blocking…" : "Block time"}
      isDisabled={!valid || isPending}
      onClose={() => onOpenChange(false)}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">The room cannot host sessions at this time. Shown on the calendar; treated as a conflict by duplicate.</p>
        <div className="flex flex-col gap-1">
          <Label>Room</Label>
          <select
            className="w-full px-4 border-2 border-gray-200 rounded-lg text-gray-999 focus:outline-none focus:border-brand-500 transition-colors h-[42px] bg-transparent"
            value={form.room_id}
            disabled={isLoadingRooms}
            onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
          >
            <option value="">Select room…</option>
            {(rooms?.data ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Title</Label>
          <Input placeholder="e.g. Private event" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <Label>Date</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Start</Label>
            <Input type="time" value={form.time_start} onChange={(e) => setForm((f) => ({ ...f, time_start: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>End</Label>
            <Input type="time" value={form.time_end} onChange={(e) => setForm((f) => ({ ...f, time_end: e.target.value }))} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Reason (optional)</Label>
          <Input placeholder="Type here.." value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
        </div>
      </div>
    </BaseDialogComponent>
  );
};
