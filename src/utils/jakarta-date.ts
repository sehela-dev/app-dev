/**
 * Return today's date in `yyyy-MM-dd` as seen in Jakarta (UTC+7),
 * independent of the device's local timezone.
 */
export const getTodayJakarta = (): string => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const jakartaMs = utcMs + 7 * 60 * 60 * 1000;
  const d = new Date(jakartaMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
