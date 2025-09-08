import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface INavHeaderComponentProps {
  title?: string;
}

export const NavHeaderComponent = ({ title = "Checkout" }: INavHeaderComponentProps) => {
  return (
    <div className="flex flex-row items-center font-serif border-b border-brand-100 w-full max-h-[58px]">
      <div className="flex flex-row items-center gap-2 p-4">
        <Button className="!p-0" variant={"ghost"}>
          <ArrowLeft size={24} strokeWidth={3} />
        </Button>
        <p className="text-xl font-extrabold">{title}</p>
      </div>
    </div>
  );
};
