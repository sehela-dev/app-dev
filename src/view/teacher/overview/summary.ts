/** Pure summary math for the teacher Overview page.
 *  Kept dependency-free so `node --experimental-strip-types --test` can run it.
 */

export interface TeachingSession {
  session_id: string;
  session_name: string;
  class_name: string | null;
  start_datetime: string;
  end_datetime: string;
  status: string;
  capacity: number;
  booked_count: number;
  attended_count: number;
  no_show_count: number;
}

export interface InvoiceTotal {
  report_year: number;
  report_month: number;
  total_payment: number;
  status: "invoiced" | "paid";
}

export interface EarningsSession {
  session_id: string;
  class_name: string | null;
  fee: number;
}

export interface TrendPoint {
  period: string;
  total: number | null;
  status: "paid" | "invoiced" | "none";
  provisional: boolean;
}

export interface ClassSummary {
  class_name: string;
  sessions: number;
  hours: number;
  earnings: number;
}

export interface AttendanceTotals {
  booked: number;
  capacity: number;
  attended: number;
  no_show: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const classKey = (session: { class_name: string | null }) =>
  session.class_name?.trim() || "Other";

export function hoursBetween(startDatetime: string, endDatetime: string): number {
  const ms = Date.parse(endDatetime) - Date.parse(startDatetime);
  return ms > 0 ? ms / 3_600_000 : 0;
}

export function sumHours(sessions: Array<{ start_datetime: string; end_datetime: string }>): number {
  return round1(sessions.reduce((sum, s) => sum + hoursBetween(s.start_datetime, s.end_datetime), 0));
}

export function sessionsInPeriod(
  sessions: TeachingSession[],
  periodStart: string,
  periodEnd: string,
): TeachingSession[] {
  const start = new Date(`${periodStart}T00:00:00+07:00`).getTime();
  const end = new Date(`${periodEnd}T23:59:59.999+07:00`).getTime();
  return sessions.filter((s) => {
    const t = Date.parse(s.start_datetime);
    return t >= start && t <= end;
  });
}

/** Taught = already started and not canceled. Admins do not always flip
 *  "completed", so completed-only would undercount the load. */
export function taughtSessions(
  sessions: TeachingSession[],
  nowIso: string,
  periodStart: string,
  periodEnd: string,
): TeachingSession[] {
  const now = Date.parse(nowIso);
  return sessionsInPeriod(sessions, periodStart, periodEnd).filter(
    (s) => s.status !== "canceled" && Date.parse(s.start_datetime) < now,
  );
}

export function upcomingWithin(
  sessions: TeachingSession[],
  nowIso: string,
  days: number,
): TeachingSession[] {
  const now = Date.parse(nowIso);
  const until = now + days * 24 * 3_600_000;
  return sessions.filter((s) => {
    const t = Date.parse(s.start_datetime);
    return s.status !== "canceled" && t >= now && t <= until;
  });
}

export function distinctClasses(sessions: TeachingSession[]): number {
  return new Set(sessions.map(classKey)).size;
}

export function hasNoActivity(
  pastSessionCount: number,
  upcomingSessionCount: number,
  invoiceCount: number,
): boolean {
  return pastSessionCount === 0 && upcomingSessionCount === 0 && invoiceCount === 0;
}

export function fillRate(booked: number, capacity: number): number | null {
  return capacity > 0 ? booked / capacity : null;
}

export function noShowRate(attended: number, noShow: number): number | null {
  const marked = attended + noShow;
  return marked > 0 ? noShow / marked : null;
}

export function attendanceTotals(sessions: TeachingSession[]): AttendanceTotals {
  return sessions.reduce(
    (acc, s) => ({
      booked: acc.booked + s.booked_count,
      capacity: acc.capacity + s.capacity,
      attended: acc.attended + s.attended_count,
      no_show: acc.no_show + s.no_show_count,
    }),
    { booked: 0, capacity: 0, attended: 0, no_show: 0 },
  );
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return round1(((current - previous) / previous) * 100);
}

export function trendPoints(
  periods: string[],
  invoices: InvoiceTotal[],
  currentPeriod: string,
  currentTotal: number,
  currentProvisional: boolean,
): TrendPoint[] {
  const byPeriod = new Map(
    invoices.map((invoice) => [
      `${invoice.report_year}-${pad(invoice.report_month)}`,
      invoice,
    ]),
  );

  return periods.map((period) => {
    const invoice = byPeriod.get(period);
    if (period === currentPeriod) {
      return {
        period,
        total: round2(currentTotal),
        status: invoice?.status ?? "none",
        provisional: currentProvisional,
      };
    }
    if (!invoice) {
      return { period, total: null, status: "none", provisional: false };
    }
    return {
      period,
      total: round2(Number(invoice.total_payment)),
      status: invoice.status,
      provisional: false,
    };
  });
}

export function classBreakdown(
  sessions: TeachingSession[],
  earningsSessions: EarningsSession[],
): ClassSummary[] {
  const feeBySession = new Map<string, number>();
  for (const row of earningsSessions) {
    feeBySession.set(row.session_id, (feeBySession.get(row.session_id) ?? 0) + Number(row.fee));
  }

  const groups = new Map<string, ClassSummary>();
  for (const session of sessions) {
    const name = classKey(session);
    const group = groups.get(name) ?? { class_name: name, sessions: 0, hours: 0, earnings: 0 };
    group.sessions += 1;
    group.hours = round1(group.hours + hoursBetween(session.start_datetime, session.end_datetime));
    group.earnings = round2(group.earnings + (feeBySession.get(session.session_id) ?? 0));
    groups.set(name, group);
  }

  return [...groups.values()].sort(
    (a, b) =>
      b.earnings - a.earnings ||
      b.sessions - a.sessions ||
      a.class_name.localeCompare(b.class_name),
  );
}
