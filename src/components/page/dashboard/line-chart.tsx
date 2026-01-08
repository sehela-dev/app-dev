/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Area, AreaChart, XAxis } from "recharts";
import { useId } from "react";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { formatDateHelper } from "@/lib/helper";

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface IProps {
  isUp?: boolean;
  data: any[];
  keyValue: string;
  /** optional: if you prefer to control ID from parent */
  idSuffix?: string;
  dataKey?: string;
  showXAxis?: boolean;
}

export function LineChartComponent({ data, isUp = false, keyValue, idSuffix, dataKey = "week_start", showXAxis = false }: IProps) {
  const rid = useId(); // stable across SSR/CSR
  const fillId = `fill-${idSuffix ?? keyValue}-${rid}`;
  const strokeId = `stroke-${idSuffix ?? keyValue}-${rid}`;

  return (
    <ChartContainer config={chartConfig} className="h-full max-h-[200px] min-h-[100px] w-full">
      <AreaChart accessibilityLayer data={data} margin={{ left: 40, right: 40 }}>
        <defs>
          {isUp ? (
            <>
              <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sobat-primary)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-sobat-light-green)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sobat-primary)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-sobat-light-green)" stopOpacity={0.1} />
              </linearGradient>
            </>
          ) : (
            <>
              <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D83232" stopOpacity={1} />
                <stop offset="95%" stopColor="#D83232" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FECACA" stopOpacity={1} />
                <stop offset="95%" stopColor="#FFFFFF80" stopOpacity={0.1} />
              </linearGradient>
            </>
          )}
        </defs>

        {/* <CartesianGrid vertical={false} /> */}
        {showXAxis && (
          <XAxis
            dataKey={dataKey}
            tickFormatter={(value) => {
              // return moment(value, "YYYY-MM-DD").format("MMMM/2025").toString();
              return formatDateHelper(value, "dd/MM/yyyy");
            }}
          />
        )}

        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Area dataKey={keyValue} type="linear" fill={`url(#${fillId})`} fillOpacity={0.4} stroke={`url(#${strokeId})`} />
      </AreaChart>
    </ChartContainer>
  );
}
