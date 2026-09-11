"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IProps {
  title: string;
  amount: string;
  percentage?: string | number;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  amountClassName?: string;
  subtitleClassName?: string;
  icon: React.ReactElement;
}

export const CardRevenueComponent = (props: IProps) => {
  return (
    <Card className={cn("w-full", props.className)}>
      <CardHeader hidden></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center w-full justify-between">
            <p className="font-medium text-sm">{props?.title}</p>
            {props?.icon}
            {/* <CircleDollarSign
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            /> */}
          </div>
          <p className={cn("text-[24px] font-bold", props.amountClassName)}>{props?.amount}</p>
          {props?.subtitle && <p className={cn("text-sm font-medium text-muted-foreground", props.subtitleClassName)}>{props.subtitle}</p>}
          {props?.footer && <div className="text-xs text-gray-500">{props.footer}</div>}
          {props?.percentage && <p className="text-xs text-gray-500">{props?.percentage}% from last month</p>}
        </div>
      </CardContent>
    </Card>
  );
};
