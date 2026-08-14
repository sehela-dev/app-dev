"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { DateRangePicker } from "@/components/base/date-range-picker";
import { AuditLogDetailsComponent, getActionBadge, AUDIT_ACTION_OPTIONS } from "@/components/page/audit-log/audit-log-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAuditLogs } from "@/hooks/api/queries/admin/admin-management";
import { defaultDate, formatDateHelper } from "@/lib/helper";
import { IAdminAuditLog } from "@/types/admin-management.interface";
import { EyeIcon, ListFilter } from "lucide-react";
import { useState } from "react";

export const AuditLogListPage = () => {
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedRange, setSelectedRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<IAdminAuditLog | null>(null);

  const { data, isLoading } = useGetAuditLogs({
    page,
    page_size: limit,
    action: actionFilter === "all" ? undefined : actionFilter,
    start_date: selectedRange?.startDate ?? undefined,
    end_date: selectedRange?.endDate ?? undefined,
  });

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, startDate: startDate as string, endDate: endDate as string }));
    setPage(1);
  };

  const handleOpenDetails = (log: IAdminAuditLog) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  const headers = [
    {
      id: "action",
      text: "Action",
      value: (row: IAdminAuditLog) => {
        const config = getActionBadge(row.action);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "actor_name",
      text: "Actor",
      value: (row: IAdminAuditLog) => (
        <div className="flex flex-col">
          <span className="font-medium text-brand-999">{row.actor_name}</span>
          <span className="text-xs text-gray-500">{row.actor_auth_user_id}</span>
        </div>
      ),
    },
    {
      id: "target_name",
      text: "Target",
      value: (row: IAdminAuditLog) =>
        row.target_name ? (
          <div className="flex flex-col">
            <span className="font-medium text-brand-999">{row.target_name}</span>
            <span className="text-xs text-gray-500">{row.target_email ?? "-"}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      id: "reason",
      text: "Reason",
      value: (row: IAdminAuditLog) => row.reason ?? "-",
    },
    {
      id: "created_at",
      text: "Date",
      value: (row: IAdminAuditLog) => formatDateHelper(row.created_at, "dd/MM/yyyy HH:mm"),
    },
  ];

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IAdminAuditLog) => (
      <Button variant={"outline"} size={"icon"} onClick={() => handleOpenDetails(row)}>
        <EyeIcon />
      </Button>
    ),
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Audit Logs</h3>
            <p className="text-sm text-gray-500">View the full audit trail of actions performed across the system.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={actionFilter} onValueChange={(e) => { setActionFilter(e); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {AUDIT_ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker
              mode="range"
              onDateRangeChange={handleDateRangeChange}
              startDate={selectedRange?.startDate ?? undefined}
              endDate={selectedRange?.endDate ?? undefined}
              allowFutureDates
              allowPastDates
            />
            <div>
              <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
                <ListFilter /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable data={data?.data ?? []} headers={headers} numberOptions={numberOptions} isLoading={isLoading} actionOptions={actionOptions} />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={(e) => setPage(e)}
            currentPage={page}
            showTotal
            hasNextPage={data?.pagination?.has_next}
            hasPrevPage={data?.pagination?.has_prev}
            totalItems={data?.pagination?.total_items as number}
            totalPages={data?.pagination?.total_pages as number}
            limit={10}
          />
        </CardFooter>
      </Card>
      <AuditLogDetailsComponent
        isOpen={openDetails}
        log={selectedLog}
        onClose={() => {
          setOpenDetails(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
};
