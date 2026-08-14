"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { AuditLogDetailsComponent, getActionBadge } from "@/components/page/audit-log/audit-log-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";
import { useGetAdminDetail } from "@/hooks/api/queries/admin/admin-management/use-get-admin-detail";
import { useGetAdminAuditLogs } from "@/hooks/api/queries/admin/admin-management/use-get-admin-audit-logs";
import { formatDateHelper } from "@/lib/helper";

import { IAdminAuditLog, IAdminProfile } from "@/types/admin-management.interface";

import { EyeIcon, Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const detailTabs = [
  { value: "basic", name: "Information" },
  { value: "audit", name: "Audit Logs" },
];

export const AdminManagementDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [tabs, setTabs] = useState("basic");
  const [page, setPage] = useState(1);
  const [openChanges, setOpenChanges] = useState(false);
  const [selectedLog, setSelectedLog] = useState<IAdminAuditLog | null>(null);

  const { data: profile, isLoading } = useGetAdminDetail(id as string);
  const { data: logs, isLoading: loadingLogs } = useGetAdminAuditLogs({ id: id as string, page, page_size: 10 });

  const handleOpenChanges = (log: IAdminAuditLog) => {
    setSelectedLog(log);
    setOpenChanges(true);
  };

  const handleCloseChanges = () => {
    setOpenChanges(false);
    setSelectedLog(null);
  };

  const handleTabChange = (tab: React.SetStateAction<string>) => {
    const resolved = typeof tab === "function" ? tab(tabs) : tab;
    setTabs(resolved);
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  const admin = profile as IAdminProfile | null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="max-w-fit">
        <GeneralTabComponent selecetedTab={tabs} setTab={handleTabChange} tabs={detailTabs} />
      </div>
      {tabs === "basic" && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center w-full justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">Admin Information</h3>
                <p className="text-sm text-gray-500">Review admin/manager account information and audit trail.</p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <Button onClick={() => router.push(`admins/${id}/edit`)}>
                  <PenIcon /> Edit
                </Button>
              </div>
            </div>
            <Divider className="my-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="grid col-span-3 text-gray-500">Full Name</div>
                <div className="grid col-span-9">{admin?.full_name ?? "-"}</div>
                <div className="grid col-span-3 text-gray-500">Email</div>
                <div className="grid col-span-9">{admin?.email ?? "-"}</div>
                <div className="grid col-span-3 text-gray-500">WhatsApp</div>
                <div className="grid col-span-9">{admin?.phone ?? "-"}</div>
                <div className="grid col-span-3 text-gray-500">Role</div>
                <div className="grid col-span-9">
                  <Badge variant={admin?.role === "manager" ? "default" : "outline"} className="capitalize">
                    {admin?.role ?? "-"}
                  </Badge>
                </div>
                <div className="grid col-span-3 text-gray-500">Status</div>
                <div className={`grid col-span-9 ${admin?.is_active ? "text-green-600" : "text-red-500"}`}>
                  {admin?.is_active ? "Active" : "Inactive"}
                </div>
                <div className="grid col-span-3 text-gray-500">Created At</div>
                <div className="grid col-span-9">{formatDateHelper(admin?.created_at as string)}</div>
                <div className="grid col-span-3 text-gray-500">Updated At</div>
                <div className="grid col-span-9">{admin?.updated_at ? formatDateHelper(admin.updated_at) : "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {tabs === "audit" && (
        <Card>
          <CardHeader className="flex flex-row w-full justify-between items-center">
            <div className="flex flex-col w-full">
              <h3 className="text-2xl font-semibold">Audit Logs</h3>
              <p className="text-sm text-gray-500">Track account management history for this admin/manager.</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <CustomTable
                headers={[
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
                    value: (row: IAdminAuditLog) => (
                      <div className="flex flex-col">
                        <span className="font-medium text-brand-999">{row.target_name}</span>
                        <span className="text-xs text-gray-500">{row.target_email}</span>
                      </div>
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
                ]}
                data={logs?.data ?? []}
                isLoading={loadingLogs}
                numberOptions={{
                  text: "No",
                  show: true,
                  render: (_: unknown, idx: number) => buildNumber(idx, 10, page),
                }}
                actionOptions={{
                  text: "Action",
                  show: true,
                  render: (row: IAdminAuditLog) => (
                    <Button variant={"outline"} size={"icon"} onClick={() => handleOpenChanges(row)}>
                      <EyeIcon />
                    </Button>
                  ),
                }}
              />
              <CustomPagination
                onPageChange={(e) => setPage(e)}
                currentPage={page}
                showTotal
                hasNextPage={logs?.pagination?.has_next}
                hasPrevPage={logs?.pagination?.has_prev}
                totalItems={logs?.pagination?.total_items as number}
                totalPages={logs?.pagination?.total_pages as number}
                limit={10}
              />
            </div>
          </CardContent>
        </Card>
      )}
      <AuditLogDetailsComponent
        isOpen={openChanges}
        log={selectedLog}
        onClose={handleCloseChanges}
      />
    </div>
  );
};