/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { CardRevenueComponent } from "@/components/page/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { useGenerateOutstandingReport } from "@/hooks/api/mutations/admin";
import { useGetOutstandingCreditTable } from "@/hooks/api/queries/admin/report/outstanding-credit";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { IGeenrateOutstandingResponse, IPackage } from "@/types/report.interface";
import { BadgeDollarSign, DollarSign, Download, FileText, Loader2, Package2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

// •⁠  ⁠Active: Green
// •⁠  ⁠Not Started: Gray
// •⁠  ⁠Expiring Soon: Orange
// •⁠  ⁠Fully Used: Blue
// •⁠  ⁠Expired: Red

const PACKAGE_STATUS = {
  active: {
    label: "Active",
    color: "green-500",
  },

  not_started: {
    label: "Not Started",
    color: "gray-400",
  },

  expiring_soon: { label: "Expires Soon", color: "yellow-200" },
  fully_used: { label: "Fully Used", color: "blue-800" },
  expired: { label: "Expired", color: "red-500" },
};

const tabOption = [
  {
    name: "Preview",
    value: "preview",
  },
  {
    name: "Export",
    value: "export",
  },
];

const defaultValues = {
  month: "",
  year: "",
};

export const OutstandingCreditView = () => {
  const methods = useForm({ defaultValues });
  const [tabs, setTabs] = useState("preview");
  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedTwoWeeksBefore,
    to: defaultDate().formattedToday,
  });

  const formField = methods.watch();

  const [generatedFile, setGeneratedFile] = useState<IGeenrateOutstandingResponse | null>(null);

  const { data, isLoading, refetch, isFetching, isSuccess } = useGetOutstandingCreditTable({
    startDate: selectedRange.from,
    endDate: selectedRange.to,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  const { mutateAsync, isPending } = useGenerateOutstandingReport();

  const headers = [
    {
      id: "customer-name",
      text: "Customer Name",
      value: "customer_name",
    },

    {
      id: "package-name",
      text: "Package Name",
      value: "package_name",
    },
    {
      id: "package_status",
      text: "Package Status",
      value: (row: IPackage) => (
        <Badge className={`bg-${(PACKAGE_STATUS as any)[row.package_status].color} text-brand-999`}>
          {(PACKAGE_STATUS as any)[row.package_status].label}
        </Badge>
      ),
    },
    {
      id: "total-credits",
      text: "Total Credits",
      value: "total_credits",
    },
    {
      id: "credits-remaining",
      text: "Credits Remaining",
      value: "credits_remaining",
    },
    {
      id: "credits-used",
      text: "Credits Used",
      value: "credits_used",
    },
    {
      id: "credits-expired",
      text: "Credits Expired",
      value: "credits_expired",
    },
    {
      id: "outstanding-value-idr",
      text: "Outstanding Value (IDR)",
      value: (row: IPackage) => formatCurrency(row.outstanding_value_idr),
    },
    {
      id: "purchased-at",
      text: "Purchased at",
      value: (row: IPackage) => (row?.purchased_at ? formatDateHelper(row.purchased_at as string) : "-"),
    },
    {
      id: "expired-at",
      text: "Expired at",
      value: (row: IPackage) => (row?.expires_at ? formatDateHelper(row.expires_at as string) : "-"),
    },
    {
      id: "days-until-expiry",
      text: "Days until Expiry",
      value: "days_until_expiry",
    },
  ];

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const paylaod = {
        month: data?.month as string,
        year: data?.year as string,
      };
      const res = await mutateAsync(paylaod);
      if (res) {
        setGeneratedFile(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  });
  return (
    <div className="flex flex-col gap-4">
      <GeneralTabComponent tabs={tabOption} selecetedTab={tabs} setTab={setTabs} />
      {tabs === "preview" && (
        <>
          <Card>
            <CardHeader className="text-2xl font-semibold">Preview Outstanding Credit</CardHeader>
            <CardContent>
              <div className="flex flex-row items-center w-full">
                <div className="flex flex-col gap-4 w-full">
                  <div className="w-full flex flex-col gap-1">
                    <p className="text-sm font-medium">Date From</p>
                    <DateRangePicker
                      mode="range"
                      onDateRangeChange={handleDateRangeChangeDual}
                      startDate={selectedRange.from}
                      endDate={selectedRange.to}
                      allowPastDates
                      maxSelectionDays={14}
                    />
                  </div>
                  <div className="flex justify-end items-end w-full">
                    <Button
                      onClick={() => {
                        refetch();
                      }}
                    >
                      Generate Table
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {isLoading && isFetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {data?.data && (
                <div className="flex flex-col gap-4 pt-4 w-full">
                  <div className="flex flex-row items-center w-full gap-4">
                    <div className="w-full">
                      <CardRevenueComponent
                        amount={`${String(data?.data?.summary?.totals.total_credits_remaining)} / ${String(
                          data?.data?.summary?.totals.total_credits_purchased,
                        )}`}
                        title="Total Credit Remaining"
                        icon={
                          <BadgeDollarSign
                            style={{
                              color: "var(--color-gray-400)",
                            }}
                            size={18}
                          />
                        }
                      />
                    </div>
                    <div className="w-full">
                      <CardRevenueComponent
                        amount={formatCurrency(String(data?.data?.summary?.totals.total_outstanding_value_idr))}
                        title="Oustanding Value (IDR)"
                        icon={
                          <DollarSign
                            style={{
                              color: "var(--color-gray-400)",
                            }}
                            size={18}
                          />
                        }
                      />
                    </div>
                  </div>
                  <Card>
                    <CardHeader className="text-lg font-semibold">
                      Outstanding Credit {selectedRange.from} to {selectedRange?.to}
                    </CardHeader>
                    <CardContent>
                      <CustomTable headers={headers} data={data?.data.packages ?? []} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </>
      )}
      {tabs === "export" && (
        <>
          {" "}
          <Card>
            <CardHeader className="text-2xl font-semibold">Export Data - Outstanding Credit</CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={onSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={methods.control}
                      name={`month`}
                      rules={{
                        required: "Field Required!",
                      }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className=" text-brand-999 font-medium text-sm" required>
                            Select Month
                          </FormLabel>
                          <FormControl>
                            <Select
                              {...field}
                              onValueChange={(e) => {
                                field.onChange(e);
                              }}
                              defaultValue={field.value ?? ""}
                              value={field.value ?? ""}
                            >
                              <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                                <SelectValue placeholder="Select Month" className="!text-gray-400" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {MONTH_LIST.map((item) => (
                                    <SelectItem value={item.value} key={item.value}>
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`year`}
                      rules={{
                        required: "Field Required!",
                      }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className=" text-brand-999 font-medium text-sm" required>
                            Select Year
                          </FormLabel>
                          <FormControl>
                            <Select
                              {...field}
                              onValueChange={(e) => {
                                field.onChange(e);
                              }}
                              defaultValue={field.value ?? ""}
                              value={field.value ?? ""}
                            >
                              <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                                <SelectValue placeholder="Select Year" className="!text-gray-400" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {YEAR_LIST.map((item) => (
                                    <SelectItem value={item} key={item}>
                                      {item}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-row items-center w-full justify-end gap-4 pt-4">
                    <div>
                      <Button
                        type="button"
                        variant={"secondary"}
                        onClick={() => {
                          methods.reset();
                          setGeneratedFile(null);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <div>
                      <Button disabled={!methods.formState.isValid || isPending}>Export Report</Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
          {generatedFile && (
            <div className="flex flex-col gap-4 w-full items-center pt-4">
              <ReportDownloads
                detailFileName={generatedFile?.detail_file?.file_name as string}
                detailLink={generatedFile?.detail_file?.download_url as string}
                summaryLink={generatedFile?.summary_file?.download_url as string}
                summaryFileName={generatedFile?.summary_file?.file_name as string}
                month={formField.month}
                year={formField.year}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ReportDownloadsProps {
  detailLink?: string;
  summaryLink?: string;
  isLoading?: boolean;
  summaryFileName?: string;
  detailFileName?: string;
  month?: string;
  year?: string;
}

export function ReportDownloads({ detailLink, summaryLink, isLoading = false, summaryFileName, detailFileName, month, year }: ReportDownloadsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">
          Your Reports for {MONTH_LIST.find((p) => p.value === month)?.label} {year} Are Ready
        </h3>
        <p className="text-sm text-muted-foreground">Download your generated reports below</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Detail Report Card */}
        {detailLink && (
          <Card className="flex flex-col gap-4 border-2  p-6 transition-all hover:border-brand-500 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Detail Report</h4>
                <p className="text-xs text-muted-foreground">{detailFileName}</p>
              </div>
            </div>
            <Button asChild disabled={isLoading} className="w-full gap-2">
              <a href={detailLink} download>
                <Download className="h-4 w-4" />
                Download Detail
              </a>
            </Button>
          </Card>
        )}

        {/* Summary Report Card */}
        {summaryLink && (
          <Card className="flex flex-col gap-4 border-2  p-6 transition-all hover:border-brand-500 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Summary Report</h4>
                <p className="text-xs text-muted-foreground">{summaryFileName}</p>
              </div>
            </div>
            <Button asChild disabled={isLoading} className="w-full gap-2" variant={"secondary"}>
              <a href={summaryLink} download>
                <Download className="h-4 w-4" />
                Download Summary
              </a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
