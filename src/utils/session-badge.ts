export interface ISessionBadge {
  label: string;
  className: string;
}

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