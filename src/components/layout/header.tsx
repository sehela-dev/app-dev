import { Gem, Menu } from "lucide-react";
import { LogoComponent } from "../asset/logo";
import { Button } from "../ui/button";

export const MainHeaderComponent = () => {
  return (
    <div className="bg-gray-50 min-h-[58px] sticky top-0 z-50 w-full shadow-subtle shrink-0 ">
      <div className="flex flex-row items-center justify-between w-full p-3">
        <div className="flex flex-1">
          <LogoComponent className="w-[99px] h-[32px]" />
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex">
            <Button className="border-brand-50 text-brand-500 text-sm font-serif leading-[130%] font-extrabold rounded-lg" variant={"outline"}>
              <Gem color="var(--color-brand-500)" />
              21 Credits
            </Button>
          </div>
          <div className="flex">
            <Button className="border-brand-50 rounded-lg bg-brand-500" variant={"outline"}>
              <Menu color="var(--color-gray-50)" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
