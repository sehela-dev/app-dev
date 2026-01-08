"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface IProps {
  title: string;
  amount: string;
  percentage?: string | number;
  icon: React.ReactElement;
}

export const CardRevenueComponent = (props: IProps) => {
  return (
    <Card className="w-full">
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
          <p className="text-[24px] font-bold">{props?.amount}</p>
          {props?.percentage && <p className="text-xs text-gray-500">{props?.percentage}% from last month</p>}
        </div>
      </CardContent>
    </Card>
  );
};
