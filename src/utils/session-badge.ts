export interface ISessionBadge {
  label: string;
  className: string;
}

export interface ISchedulable {
  is_published?: boolean;
  publish_at?: string | null;
}

// Draft with a future publish_at = scheduled go-live (BE flips it automatically;
// public listing already treats due drafts as live).
export const isScheduled = (s?: ISchedulable | null): boolean =>
  !!s && s.is_published === false && !!s.publish_at && new Date(s.publish_at).getTime() > Date.now();

// ponytail: coarse countdown, upgrade to live ticking if anyone asks
export const formatPublishCountdown = (publishAt?: string | null): string => {
  if (!publishAt) return "";
  const ms = new Date(publishAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "going live…";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `in ${h}h${m % 60 ? ` ${m % 60}m` : ""}`;
  const d = Math.floor(h / 24);
  return `in ${d}d${h % 24 ? ` ${h % 24}h` : ""}`;
};

// All wall-clock inputs are WIB (GMT+7, no DST). publish_at MUST carry an
// explicit +07:00 — a bare local ISO string is parsed by BE as UTC and would
// go live 7 hours early. WIB-anchored both ways so browser TZ never matters.
export const toLocalInputValue = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const wib = new Date(d.getTime() + 7 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}T${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}`;
};

export const fromLocalInputValue = (local?: string | null): string | null => {
  if (!local) return null;
  if (Number.isNaN(new Date(local).getTime())) return null;
  const m = local.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::\d{2})?$/);
  if (!m) return null;
  return `${m[1]}:00+07:00`;
};

export const getSessionTypeBadge = (type: string): ISessionBadge => {
  switch (type) {
    case "special":
      return {
        label: "Special",
        className: "bg-violet-500/15 text-violet-800 border-violet-500/30",
      };
    case "regular":
    default:
      return {
        label: "Regular",
        className: "bg-brand-500/10 text-brand-600 border-brand-500/20",
      };
  }
};

export const getSessionLevelBadge = (level?: string | null): ISessionBadge | null => {
  switch (level) {
    case "beginner":
      return {
        label: "Newbie Yogi",
        className: "bg-green-500/15 text-green-800 border-green-500/30",
      };
    case "intermediate":
    case "all_levels":
      return {
        label: "All Levels",
        className: "bg-brand-500/10 text-brand-600 border-brand-500/20",
      };
    case "advanced":
      return {
        label: "Experienced Yogi",
        className: "bg-red-500/15 text-red-800 border-red-500/30",
      };
    default:
      return level
        ? {
            label: level,
            className: "bg-gray-100 text-gray-700 border-gray-200",
          }
        : null;
  }
};