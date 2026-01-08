/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CardRevenueComponent } from "@/components/page/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Separator } from "@/components/ui/separator";
import { useGetDashboardOverview, useGetDashboardSessionPerformance } from "@/hooks/api/queries/admin/dashboard";

import { formatCurrency, splitArray } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IOverallResultByClass } from "@/types/dashboard.interface";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, CircleDollarSign, File, Loader2, Package, Users } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const filterOption = [
  {
    name: "7D",
    value: "last_7_days",
  },
  {
    name: "1M",
    value: "last_1_months",
  },
  {
    name: "6M",
    value: "last_6_months",
  },
  {
    name: "All",
    value: "all",
  },
];

export const DashboardPage = () => {
  const { data: dashboardOverView, isLoading: isLoadingOverview } = useGetDashboardOverview();
  const { data: dashboardOverViewPerformance, isLoading: isLoadingOverviewPerformance } = useGetDashboardSessionPerformance();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [performacePagination, setPerformancePagination] = useState(0);

  const classList = useMemo(() => {
    const temp: string[] = [];
    dashboardOverViewPerformance?.data?.by_class.forEach((element) => {
      temp.push(element.class_name);
    });
    const moreClass = temp.length - 3;

    return { temp, moreClass };
  }, [dashboardOverViewPerformance?.data?.by_class]);

  const d = useMemo(() => {
    const data = splitArray(dashboardOverViewPerformance?.data?.by_class, 3);
    return {
      data,
      total: data.length,
    };
  }, [dashboardOverViewPerformance?.data?.by_class]);

  const handlePaginationClass = (type: string) => {
    if (type === "-") {
      if (performacePagination === 0) {
        setPerformancePagination(d.total - 1);
      } else {
        setPerformancePagination((prev) => prev - 1);
      }
    } else {
      if (performacePagination === d.total - 1) {
        setPerformancePagination(0);
      } else {
        setPerformancePagination((prev) => prev + 1);
      }
    }
  };

  if (isLoadingOverview || isLoadingOverviewPerformance)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold">Overview</h3>
              <p className="text-gray-400 text-sm">A quick summary of your business performance in one view.</p>
            </div>
            <div className="justify-end">
              <Button className="" variant={"outline"}>
                <File /> Export
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-flex-row items-center justify-between gap-8">
          <CardRevenueComponent
            icon={
              <CircleDollarSign
                style={{
                  color: "var(--color-gray-400)",
                }}
                size={18}
              />
            }
            title="Total Revenue"
            amount={formatCurrency(dashboardOverView?.data?.revenue?.all_time_total_idr)}
            // percentage={20}
          />
          <CardRevenueComponent
            icon={
              <Package
                style={{
                  color: "var(--color-gray-400)",
                }}
                size={18}
              />
            }
            title="Total Product Orders"
            amount={String(dashboardOverView?.data?.orders?.all_time_total)}
            // percentage={-30}
          />
          <CardRevenueComponent
            icon={
              <Users
                style={{
                  color: "var(--color-gray-400)",
                }}
                size={18}
              />
            }
            title="Total Customers"
            amount={String(dashboardOverView?.data?.members?.all_time_total)}

            // percentage={10}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold">Class Sales Perfomance</h3>
          <p className="text-gray-400 text-sm">Monitor the performance of Yoga, Ballet, and Pilates classes by bookings and revenue.</p>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between w-full">
              <h4 className="text-[20px] font-semibold">Class Overall Results</h4>
              <div className="flex flex-row items-center gap-2">
                {filterOption?.map((f) => (
                  <div key={f.value}>
                    <Button
                      size={"icon"}
                      variant={selectedFilter === f.value ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedFilter(f.value);
                        setPerformancePagination(0);
                      }}
                    >
                      {f.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-row items-start justify-between">
              <div className="flex flex-col gap-4 w-[75%]">
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 ">Class Revenue</p>
                  <div className="flex flex-row items-center gap-4">
                    <p className="text-[36px] font-medium">{formatCurrency(dashboardOverViewPerformance?.data?.summary?.all_time_total_idr)}</p>
                    {/* <div className="flex flex-row items-center gap-1">
                      <ArrowUpRight size={18} color={true ? "var(--color-green-400)" : "var(--color-red-500)"} />
                      <p
                        className={cn("text-sm", {
                          "text-green-400": true,
                          "text-red-500": false,
                        })}
                      >
                        20%
                      </p>
                    </div> */}
                  </div>
                  <div className="text-gray-500 text-wrap  flex-wrap max-w-[75%] ">
                    <p className="w-full ">{classList?.temp.slice(0, 3)?.join(", ")},</p>
                    <span>and {classList.moreClass} other class</span>
                  </div>

                  {/* <p className="text-gray-500 capitalize text-wrap flex-wrap max-w-[75%] ">{classList?.join(", ")}</p> */}
                </div>
              </div>
              <div className="min-h-[250px] h-[250px]">
                <Separator
                  orientation="vertical"
                  style={{
                    margin: "0 24px 0 0",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 w-full justify-between min-h-[250px]">
                <div className="flex flex-col gap-2 w-full h-full">
                  {d.data[performacePagination].map((item: IOverallResultByClass) => (
                    <Fragment key={item.class_id}>
                      <div className="flex flex-row items-center justify-between w-full">
                        <div className="flex flex-col w-full">
                          <p className="text-sm font-medium">{item.class_name}</p>

                          <p className="text-xs text-gray-500">Last Month</p>
                        </div>
                        <div className="flex flex-row items-center w-full gap-4">
                          {/* <div>..</div> */}
                          <div className="flex flex-col gap-1 w-full justify-end text-right">
                            <p className="font-medium">
                              {formatCurrency(
                                selectedFilter === "all" ? item.all_time_total_idr : (item.trends as any)[selectedFilter]?.revenue_idr ?? 0,
                              )}
                            </p>
                            <div className="flex flex-row items-center justify-end text-right">
                              <div>
                                {(item.trends as any)[selectedFilter]?.percentage_change > 0 ? (
                                  <ArrowUpRight color="var(--color-green-500)" size={18} />
                                ) : (
                                  <ArrowDownRight color="var(--color-red-500)" size={18} />
                                )}
                              </div>
                              <p
                                className={cn("text-sm font-medium text-red-500", {
                                  "text-green-400": (item.trends as any)[selectedFilter]?.percentage_change >= 1,
                                  "text-red-500": (item.trends as any)[selectedFilter]?.percentage_change <= 0,
                                })}
                              >
                                {(item.trends as any)[selectedFilter]?.percentage_change ?? 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Divider className="w-full" />
                    </Fragment>
                  ))}
                </div>
                <div className="flex flex-row justify-center items-center gap-2">
                  <div>
                    <Button variant={"outline"} size={"icon"} onClick={() => handlePaginationClass("-")}>
                      <ChevronLeft />
                    </Button>
                  </div>
                  <div>
                    <Button variant={"outline"} size={"icon"} onClick={() => handlePaginationClass("+")}>
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
