import { CalendarClock, Check, GemIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateHelper } from "@/lib/helper";

interface ICardCreditProps {
  title: string;
  value: number;
  isActive: boolean;
  id: string | number;
  onClick: () => void;
  disabled?: boolean;
  expiryDate?: string;
}

export const CardCreditComponent = ({ value, id, isActive, title, onClick, disabled = false, expiryDate }: ICardCreditProps) => {
  return (
    <button
      type="button"
      key={id}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={cn(
        "relative min-h-[130px] min-w-[168px] rounded-2xl border p-4 text-left flex flex-col justify-between gap-3 transition-all duration-300 select-none",
        isActive
          ? "border-brand-500 bg-brand-500 text-gray-50 shadow-md shadow-brand-500/25"
          : "border-brand-100 bg-brand-25 text-brand-500 hover:border-brand-500/60 hover:shadow-sm",
        disabled && "opacity-45 cursor-not-allowed",
        !disabled && "cursor-pointer",
      )}
    >
      <div className="flex flex-col gap-1.5">
        <p className="flex items-baseline gap-1.5">
          <GemIcon size={18} className="shrink-0 self-center" />
          <span className="text-2xl font-bold leading-none tracking-tight">{value}</span>
          <span className="text-xs font-medium opacity-75">credits</span>
        </p>
        <p className={cn("text-sm font-medium leading-snug line-clamp-2", isActive ? "text-gray-50/90" : "text-brand-500/80")}>{title}</p>
      </div>

      {expiryDate && (
        <p className={cn("flex items-center gap-1.5 text-xs", isActive ? "text-gray-50/80" : "text-brand-500/60")}>
          <CalendarClock size={13} className="shrink-0" />
          Exp {formatDateHelper(expiryDate, "dd MMM yyyy")}
        </p>
      )}

      {isActive && (
        <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-gray-50 text-brand-500">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};