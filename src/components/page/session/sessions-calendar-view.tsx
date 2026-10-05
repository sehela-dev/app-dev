"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventCalendar } from "@/components/reui/event-calendar/event-calendar";
import type { EventCalendarRenderEventProps } from "@/components/reui/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content";
import { EventCalendarNav } from "@/components/reui/event-calendar/event-calendar-nav";
import type {
  CalendarEvent,
  EventCalendarRangeInfo,
  EventCalendarSlotInfo,
} from "@/components/reui/event-calendar/event-calendar-types";
import { SEHELA_BRANCH } from "@/constants/sample-data";
import type { ISessionItem } from "@/types/class-sessions.interface";
import type { IRoomBlock } from "@/types/class-room.interface";
import { formatPublishCountdown, isScheduled } from "@/utils/session-badge";
import { format } from "date-fns";
import { useMemo, useState } from "react";

// Branch identity survives only in avatar dots + legend (see below).
const BRANCH_COLOR: Record<string, string> = {
  studio_kemang: "#29646f",
  studio_pd_labu: "#4b5563",
};

const colorFor = (branch: string | null) => (branch && BRANCH_COLOR[branch]) || "#0d3138";

// Status chip language lifted from docs/calendar-view-ref (light theme):
// pastel fill, hairline border, thick status-color left edge, colored text.
const STATUS_CHIP: Record<string, { bg: string; line: string; ink: string }> = {
  scheduled: { bg: "#EBF2FE", line: "#C5DBFB", ink: "#3B82F6" },
  ongoing: { bg: "#E7F6ED", line: "#BCE5CB", ink: "#16A34A" },
  ended: { bg: "#F1F4F3", line: "#DCE3E1", ink: "#8E9A97" },
  canceled: { bg: "#FDF4E2", line: "#F2DFAE", ink: "#E0A020" },
};

const chipFor = (status?: string): { bg: string; line: string; ink: string } =>
  (status ? STATUS_CHIP[status] : undefined) ?? { bg: "#F1F3F6", line: "#D4DAE2", ink: "#64748B" };

// Drafts ignore status colors so unpublished sessions read as distinct at a glance.
const DRAFT_CHIP = { bg: "#F8FAFC", line: "#CBD5E1", ink: "#64748B" };
// Time blocks are not sessions — red so "room unusable" reads instantly.
const BLOCKED_CHIP = { bg: "#FDF2F2", line: "#FECACA", ink: "#B91C1C" };
const chipForSession = (session?: ISessionItem | null) =>
  session?.is_published === false ? DRAFT_CHIP : chipFor(session?.status);
const isDraft = (session?: ISessionItem | null) => session?.is_published === false;
const draftLabel = (session?: ISessionItem | null) =>
  isScheduled(session) ? `SCHED ${formatPublishCountdown(session?.publish_at)}` : "DRAFT";

function toCalendarEvent(row: ISessionItem): CalendarEvent<ISessionItem> | null {
  const start = new Date(row.start_datetime);
  const end = new Date(row.end_datetime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return {
    id: row.id,
    title: `${row.session_name} · ${row.class.class_name}`,
    start,
    end,
    // Wrapper fill = pastel status bg; ink/line come from chipFor in render.
    color: chipFor(row.status).bg,
    readOnly: true,
    data: row,
  };
}

// Block wall-clock (WIB) is authoritative; UTC raws are fallback.
function toBlockEvent(row: IRoomBlock): CalendarEvent<ISessionItem> | null {
  const start = row.start_datetime ? new Date(row.start_datetime) : new Date(`${row.start_date}T${row.time_start}:00+07:00`);
  const end = row.end_datetime ? new Date(row.end_datetime) : new Date(`${row.start_date}T${row.time_end}:00+07:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return {
    id: `block:${row.id}`,
    title: `Blocked · ${row.title}`,
    start,
    end,
    color: BLOCKED_CHIP.bg,
    readOnly: true,
  };
}

const timeOf = (d: Date) => format(d, "h:mm a");

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function InstructorAvatar({ name, tint, className }: { name: string; tint: string; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback
        className="font-serif text-[8px] font-semibold"
        style={{ backgroundColor: `color-mix(in srgb, ${tint} 18%, white)`, color: tint }}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}

const dimFor = (status: string) => (status === "ended" || status === "canceled" ? "opacity-70" : "");

// Module-level so the calendar can memoize custom content instead of
// re-rendering it on every pointer move.
function renderSessionChip({ occurrence, segment, view }: EventCalendarRenderEventProps<ISessionItem>) {
  const session = occurrence.event.data;
  const name = session?.session_name ?? occurrence.event.title;
  // Dataless events are time blocks (see toBlockEvent).
  const chip = session ? chipForSession(session) : BLOCKED_CHIP;
  const draft = isDraft(session);
  const branch = draft ? chip.ink : session?.branch ? colorFor(session.branch) : chip.ink;
  const dim = dimFor(session?.status ?? "");
  const minutes = (segment.endMin ?? 0) - (segment.startMin ?? 0);

  if (view === "month") {
    return (
      <span
        className={`flex w-full min-w-0 items-center gap-1.5 rounded border border-l-4 px-1.5 py-px ${dim} ${draft ? "border-dashed" : ""}`}
        style={{ borderColor: chip.line, borderLeftColor: chip.ink }}
      >
        {session ? (
          <InstructorAvatar name={session.instructor_name} tint={branch} className="size-4 shrink-0" />
        ) : (
          <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: chip.ink }} />
        )}
        <span
          className={`truncate font-serif text-[12.5px] leading-tight font-medium ${session?.status === "canceled" ? "line-through" : ""}`}
          style={{ color: chip.ink }}
        >
          {name}
        </span>
        {draft && (
          <span className="shrink-0 rounded border border-dashed px-1 text-[10px] font-bold tracking-wide" style={{ borderColor: chip.line, color: chip.ink }}>
            {draftLabel(session)}
          </span>
        )}
        {segment.isStart && (
          <span className="ms-auto shrink-0 text-[11px] tabular-nums opacity-80" style={{ color: chip.ink }}>
            {timeOf(occurrence.start)}
          </span>
        )}
      </span>
    );
  }

  if (minutes >= 60 && session) {
    const pct = session.slots_total > 0 ? Math.min(100, (session.slots_booked / session.slots_total) * 100) : 0;
    return (
      <span className={`flex min-w-0 items-start gap-1.5 leading-snug ${dim}`}>
        <InstructorAvatar name={session.instructor_name} tint={branch} className="size-5 shrink-0" />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-serif text-[13px] leading-tight font-medium" style={{ color: chip.ink }}>
              {name}
            </span>
            {draft && (
              <span className="shrink-0 rounded border border-dashed px-1 text-[10px] font-bold tracking-wide" style={{ borderColor: chip.line, color: chip.ink }}>
                {draftLabel(session)}
              </span>
            )}
          </span>
          <span className="truncate text-[11px] tabular-nums opacity-80" style={{ color: chip.ink }}>
            {timeOf(occurrence.start)} – {timeOf(occurrence.end)}
          </span>
          <span className="truncate text-[11px] opacity-80" style={{ color: chip.ink }}>
            {session.instructor_name} · {session.is_full ? "FULL" : `${session.slots_display} booked`}
          </span>
          <span className="mt-1 h-0.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: chip.line }}>
            <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: chip.ink }} />
          </span>
        </span>
      </span>
    );
  }

  // Compact chip: week/day short blocks and all-day bars share the monthly
  // language. All-day bars carry no time readout.
  const compactDraft = isDraft(session);
  return (
    <span className={`flex w-full min-w-0 items-center gap-1.5 ${dim}`}>
      <span className="truncate font-serif text-[12.5px] font-medium" style={{ color: chip.ink }}>
        {name}
      </span>
      {compactDraft && (
        <span className="shrink-0 rounded border border-dashed px-1 text-[10px] font-bold tracking-wide" style={{ borderColor: chip.line, color: chip.ink }}>
          {draftLabel(session)}
        </span>
      )}
      {!occurrence.allDay && (
        <span className="ms-auto shrink-0 text-[11px] tabular-nums opacity-80" style={{ color: chip.ink }}>
          {timeOf(occurrence.start)}
        </span>
      )}
    </span>
  );
}

function renderSessionAgendaRow({ occurrence }: EventCalendarRenderEventProps<ISessionItem>) {
  const session = occurrence.event.data;
  const chip = session ? chipForSession(session) : BLOCKED_CHIP;
  const draft = isDraft(session);
  const branch = draft ? chip.ink : session?.branch ? colorFor(session.branch) : chip.ink;
  return (
    <span className={`flex w-full min-w-0 items-center gap-2.5 ${dimFor(session?.status ?? "")}`}>
      <span aria-hidden className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: chip.ink }} />
      <span className="text-muted-foreground w-40 shrink-0 truncate text-[12px] tabular-nums">
        {timeOf(occurrence.start)} – {timeOf(occurrence.end)}
      </span>
      {session ? (
        <InstructorAvatar name={session.instructor_name} tint={branch} className="size-5 shrink-0" />
      ) : (
        <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: chip.ink }} />
      )}
      <span className="truncate font-serif text-sm font-medium" style={{ color: chip.ink }}>
        {occurrence.event.title}
      </span>
      {draft && (
        <span
          className="shrink-0 rounded border border-dashed px-1.5 py-0.5 text-[10px] font-bold tracking-wide"
          style={{ backgroundColor: chip.bg, borderColor: chip.line, color: chip.ink }}
        >
          {draftLabel(session)}
        </span>
      )}
      {session && (
        <span
          className="ms-auto hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline"
          style={{ backgroundColor: chip.bg, borderColor: chip.line, color: chip.ink }}
        >
          {session.is_full ? "FULL" : `${session.slots_display} booked`}
        </span>
      )}
    </span>
  );
}

interface SessionsCalendarViewProps {
  sessions: ISessionItem[];
  blocks?: IRoomBlock[];
  onRangeChange?: (info: EventCalendarRangeInfo) => void;
  onSelectSession?: (session: ISessionItem) => void;
  onSelectBlock?: (block: IRoomBlock) => void;
  onSlotClick?: (slot: EventCalendarSlotInfo, e: React.MouseEvent) => void;
}

export const SessionsCalendarView = ({
  sessions,
  blocks,
  onRangeChange,
  onSelectSession,
  onSelectBlock,
  onSlotClick,
}: SessionsCalendarViewProps) => {
  const events = useMemo(
    () => [...sessions.map(toCalendarEvent), ...(blocks ?? []).map(toBlockEvent)].filter((e) => e !== null),
    [sessions, blocks],
  );
  const blockById = useMemo(() => new Map((blocks ?? []).map((b) => [b.id, b])), [blocks]);
  // Month rows size to content (page mode) so an expanded day grows the grid
  // and the card; time views keep their bounded internal scroll.
  const [calView, setCalView] = useState("month");
  const monthMode = calView === "month";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 pt-1">
        {["scheduled", "ongoing", "ended", "canceled"].map((s) => {
          const c = chipFor(s);
          return (
            <span
              key={s}
              className="rounded border border-l-4 px-2 py-0.5 text-[11px] font-semibold capitalize"
              style={{ backgroundColor: c.bg, borderColor: c.line, borderLeftColor: c.ink, color: c.ink }}
            >
              {s === "ongoing" ? "On Going" : s}
            </span>
          );
        })}
        <span
          className="rounded border border-dashed border-l-4 px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: DRAFT_CHIP.bg, borderColor: DRAFT_CHIP.line, borderLeftColor: DRAFT_CHIP.ink, color: DRAFT_CHIP.ink }}
        >
          Draft · hidden from public
        </span>
        <span
          className="rounded border border-l-4 px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: BLOCKED_CHIP.bg, borderColor: BLOCKED_CHIP.line, borderLeftColor: BLOCKED_CHIP.ink, color: BLOCKED_CHIP.ink }}
        >
          Blocked · room unusable
        </span>
        <span aria-hidden className="mx-1 h-4 w-px bg-brand-100" />
        {SEHELA_BRANCH.map((b) => (
          <span key={b.value} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: colorFor(b.value) }} />
            {b.label}
          </span>
        ))}
      </div>
      <EventCalendar
        events={events}
        defaultView="month"
        views={["month", "week", "day", "agenda"]}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        onEventUpdate={() => false}
        onEventClick={(occurrence) => {
          const id = String(occurrence.event.id);
          if (id.startsWith("block:")) {
            const b = blockById.get(id.slice("block:".length));
            if (b) onSelectBlock?.(b);
            return;
          }
          onSelectSession?.(occurrence.event.data as ISessionItem);
        }}
        onSlotClick={onSlotClick}
        onRangeChange={(info) => {
          setCalView(info.view);
          onRangeChange?.(info);
        }}
        renderEvent={renderSessionChip}
        renderAgendaEvent={renderSessionAgendaRow}
        eventTooltip
        dayStartHour={6}
        dayEndHour={21}
        offDays={{ className: "bg-brand-50/60" }}
        scrollMode={monthMode ? "page" : "contained"}
        className={monthMode ? "min-h-[600px]" : "h-[600px]"}
        classNames={{
          nav: "px-2 py-2.5",
          title: "font-serif text-xl font-medium tracking-tight text-brand-999",
          monthView: "overflow-hidden rounded-2xl border border-brand-200",
          monthHeader: "border-brand-100 bg-brand-25/60",
          monthDayHeader: "font-serif text-[13px]",
          monthRow: "border-brand-100",
          monthCell: "border-brand-100 hover:bg-brand-25/50 transition-colors",
          monthDayNumber: "font-serif",
          event:
            "bg-(--ec-event-color) inset-ring-black/10 shadow-none hover:bg-(--ec-event-color)! hover:brightness-95 dark:bg-(--ec-event-color)! data-selected:bg-(--ec-event-color)!",
          moreIndicator: "font-medium",
          agendaItemSurface: "rounded-xl border-brand-100",
        }}
      >
        <EventCalendarNav />
        <EventCalendarContent />
      </EventCalendar>
    </div>
  );
};
