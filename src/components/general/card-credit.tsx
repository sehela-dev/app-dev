import { cn } from "@/lib/utils";

interface ICardCreditProps {
  title: string;
  value: number;
  isActive: boolean;
  id: string | number;
  onClick: () => void;
}

export const CardCreditComponent = ({ value, id, isActive, title, onClick }: ICardCreditProps) => {
  return (
    <div
      className={cn("min-h-18 min-w-[128px] border border-brand-500 rounded-xl p-4 w-fit text-center justify-center bg-none duration-300 ", {
        "!bg-brand-100": isActive,
      })}
      key={id}
      onClick={onClick}
    >
      <p className="text-sm font-medium">{value} Credit</p>
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
};
