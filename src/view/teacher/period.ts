import { formatDateHelper } from "@/lib/helper";
import { getTodayJakarta } from "@/utils/jakarta-date";

export const pad = (n: number) => String(n).padStart(2, "0");

/** Report period label (the month the 24-23 window ends in). */
export const currentPeriod = (): string => {
  const [year, month, day] = getTodayJakarta().split("-").map(Number);
  const end = new Date(Date.UTC(year, month - 1 + (day >= 24 ? 1 : 0), 1));
  return `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}`;
};

export const periodLabel = (period: string) => formatDateHelper(`${period}-01`, "MMM yyyy");

export const periodMonthLabel = (period: string) => formatDateHelper(`${period}-01`, "MMMM yyyy");

export const periodBounds = (period: string): { start: string; end: string } => {
  const [year, month] = period.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 2, 24));
  return {
    start: `${startDate.getUTCFullYear()}-${pad(startDate.getUTCMonth() + 1)}-24`,
    end: `${year}-${pad(month)}-23`,
  };
};

export const previousPeriod = (period: string): string => {
  const [year, month] = period.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 2, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

export const nextPeriod = (period: string): string => {
  const [year, month] = period.split("-").map(Number);
  const d = new Date(Date.UTC(year, month, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

/** Newest first, for the period Select. */
export const periodOptions = (count = 12): string[] => {
  const current = currentPeriod();
  return Array.from({ length: count }, (_, i) => {
    let p = current;
    for (let n = 0; n < i; n++) p = previousPeriod(p);
    return p;
  });
};

/** Oldest first, for the Overview trend. */
export const lastPeriods = (count = 12): string[] => periodOptions(count).reverse();
