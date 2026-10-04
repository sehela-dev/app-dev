"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { branchLabel } from "@/constants/sample-data";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ISessionItem } from "@/types/class-sessions.interface";
import { Building2, CalendarDays, Clock, MapPin, User, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_PILL: Record<string, string> = {
  ongoing: "bg-emerald-500/10 text-emerald-700",
  scheduled: "bg-blue-500/10 text-blue-700",
  ended: "bg-gray-500/10 text-gray-600",
  canceled: "bg-amber-500/15 text-amber-700",
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Meta({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-999">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">{label}</span>
        <span className="text-sm font-medium break-words">{children}</span>
      </span>
    </div>
  );
}

interface SessionDetailSheetProps {
  session: ISessionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDetailSheet = ({ session, open, onOpenChange }: SessionDetailSheetProps) => {
  const router = useRouter();
  const pct =
    session && session.slots_total > 0 ? Math.min(100, (session.slots_booked / session.slots_total) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="sr-only">
          <SheetTitle>{session?.session_name ?? "Session"}</SheetTitle>
        </SheetHeader>
        {session && (
          <>
            <div className="border-b border-brand-100 bg-brand-25 px-6 pt-6 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
                  {session.class.class_name}
                </span>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                    STATUS_PILL[session.status] ?? "bg-gray-500/10 text-gray-600",
                  )}
                >
                  {session.status}
                </span>
              </div>
              <h2 className="mt-2 font-serif text-[26px] leading-tight font-medium tracking-tight text-brand-999">
                {session.session_name}
              </h2>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-999 font-serif text-[11px] font-semibold text-white">
                  {initialsOf(session.instructor_name)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{session.instructor_name}</span>
                  <span className="text-xs text-gray-500">Instructor</span>
                </div>
                {session.is_full && (
                  <span className="ml-auto rounded-full bg-brand-999 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    FULL
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 px-6 py-6">
              <div className="rounded-2xl border border-brand-100 px-4 py-3.5">
                <p className="font-serif text-lg leading-snug">
                  {formatDateHelper(session.start_date, "EEEE, dd MMM yyyy")}
                </p>
                <p className="mt-0.5 text-sm text-gray-500 tabular-nums">
                  {session.time_start} – {session.time_end}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Meta icon={CalendarDays} label="Class">
                  {session.class.class_name}
                </Meta>
                <Meta icon={Clock} label="Time">
                  {session.time_start} – {session.time_end}
                </Meta>
                <Meta icon={User} label="Instructor">
                  {session.instructor_name}
                </Meta>
                <Meta icon={MapPin} label="Location">
                  <span className="capitalize">
                    {session.place === "offline" ? session.location : session.place}
                  </span>
                </Meta>
                <Meta icon={Building2} label="Branch">
                  {branchLabel(session.branch)}
                </Meta>
                <Meta icon={Wallet} label="Price">
                  {formatCurrency(session.price_idr)}
                </Meta>
                <Meta icon={Users} label="Capacity">
                  <span className="flex items-center gap-2">
                    {String(session.slots_display)}
                    {!session.is_full && (
                      <span className="text-xs font-normal text-gray-500">{session.slots_available} left</span>
                    )}
                  </span>
                  <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-black/10">
                    <span className="block h-full rounded-full bg-brand-999" style={{ width: `${pct}%` }} />
                  </span>
                </Meta>
              </div>

              {session.session_description && (
                <div className="border-t border-brand-100 pt-4">
                  <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">About</p>
                  <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-gray-700">
                    {session.session_description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2 border-t border-brand-100 px-6 py-4">
              <Button onClick={() => router.push(`session/${session.id}`)}>View full details</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
