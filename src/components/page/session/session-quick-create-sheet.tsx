"use client";

import {
  buildSessionPayload,
  createSessionDefaultValues,
  OveridePaymentModelForm,
  SessionBasicInfoFormComponent,
  SessionDateTimeFormComponent,
  SessionLocationFormComponent,
  SessionPricingFormComponent,
} from "@/components/page/session/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateNewSession } from "@/hooks/api/mutations/admin";
import { ICreateSessionPaylaod } from "@/types/class-sessions.interface";
import { addHours, format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";

export interface QuickCreateSlot {
  date: Date;
  end?: Date;
  allDay: boolean;
}

const slotDefaults = (slot: QuickCreateSlot) => ({
  ...createSessionDefaultValues,
  start_date: format(slot.date, "yyyy-MM-dd"),
  time_start: slot.allDay ? "10:00" : format(slot.date, "HH:mm"),
  time_end: slot.allDay ? "13:00" : format(slot.end ?? addHours(slot.date, 1), "HH:mm"),
});

const slotLabel = (slot: QuickCreateSlot) =>
  format(slot.date, "EEEE, d MMM yyyy") +
  (!slot.allDay ? ` · ${format(slot.date, "h:mm a")} – ${format(slot.end ?? addHours(slot.date, 1), "h:mm a")}` : "");

function QuickCreateForm({ slot, onCreated }: { slot: QuickCreateSlot; onCreated: () => void }) {
  const methods = useForm({ defaultValues: slotDefaults(slot) });
  const { watch, handleSubmit } = methods;
  const isOveride = watch("type");
  const { mutateAsync, isPending } = useCreateNewSession();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await mutateAsync(buildSessionPayload(data) as ICreateSessionPaylaod);
      if (res) onCreated();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <SessionBasicInfoFormComponent />
          {isOveride !== "regular" && <OveridePaymentModelForm prefix={"payment"} />}
          <SessionDateTimeFormComponent start_date={format(slot.date, "yyyy-MM-dd")} />
          <SessionLocationFormComponent />
          <SessionPricingFormComponent />
        </div>
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-brand-100 px-6 py-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create Session"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

interface SessionQuickCreateSheetProps {
  slot: QuickCreateSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const SessionQuickCreateSheet = ({ slot, open, onOpenChange, onCreated }: SessionQuickCreateSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-brand-100 px-6 pt-6 pb-4 text-left">
          <SheetTitle className="font-serif text-2xl font-medium tracking-tight text-brand-999">New session</SheetTitle>
          {slot && <p className="mt-1 text-sm text-gray-500">{slotLabel(slot)}</p>}
        </SheetHeader>
        {slot && <QuickCreateForm key={slot.date.getTime()} slot={slot} onCreated={onCreated} />}
      </SheetContent>
    </Sheet>
  );
};
