"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useDeactivateAdmin, useUpdateAdmin } from "@/hooks/api/mutations/admin";
import { useGetAdmins } from "@/hooks/api/queries/admin/admin-management";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatDateHelper } from "@/lib/helper";

import { IAdminProfile } from "@/types/admin-management.interface";

import { CirclePlus, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const AdminManagementListPage = () => {
  const { can, isManager } = useAdminPermission();
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedData, setSelectedData] = useState<IAdminProfile | null>(null);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openActivate, setOpenActivate] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading, refetch } = useGetAdmins({
    page,
    page_size: limit,
    q: search,
    role: roleFilter === "all" ? undefined : (roleFilter as "admin" | "manager"),
    is_active: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const { mutateAsync: deactivateAdmin, isPending: deactivating } = useDeactivateAdmin();
  const { mutateAsync: updateAdmin } = useUpdateAdmin();

  const headers = [
    {
      id: "full_name",
      text: "Name",
      value: (row: IAdminProfile) => (
        <div className="flex flex-col">
          <span className="font-medium text-brand-999">{row.full_name}</span>
          <span className="text-xs text-gray-500">{row.auth_user_id}</span>
        </div>
      ),
    },
    {
      id: "email",
      text: "Email",
      value: "email",
    },
    {
      id: "phone",
      text: "WhatsApp",
      value: (row: IAdminProfile) => row.phone ?? "-",
    },
    {
      id: "role",
      text: "Role",
      value: (row: IAdminProfile) => (
        <Badge variant={row.role === "manager" ? "default" : "outline"} className="capitalize">
          {row.role}
        </Badge>
      ),
    },
    {
      id: "is_active",
      text: "Status",
      value: (row: IAdminProfile) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${row.is_active ? "bg-green-500" : "bg-red-500"}`} />
          <span className={row.is_active ? "text-green-600" : "text-red-500"}>{row.is_active ? "Active" : "Inactive"}</span>
        </div>
      ),
    },
    {
      id: "created_at",
      text: "Created At",
      value: (row: IAdminProfile) => formatDateHelper(row.created_at),
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
    render: (row: IAdminProfile) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {can("admin:detail") && <DropdownMenuItem onClick={() => router.push(`admins/${row.auth_user_id}`)}>View Details</DropdownMenuItem>}
          {can("admin:update") && <DropdownMenuItem onClick={() => router.push(`admins/${row.auth_user_id}/edit`)}>Edit</DropdownMenuItem>}
          {isManager && can("admin:delete") && row.is_active && (
            <DropdownMenuItem variant="destructive" onClick={() => onToggleDeactivate(row, true)}>
              Deactivate
            </DropdownMenuItem>
          )}
          {isManager && can("admin:update") && !row.is_active && (
            <DropdownMenuItem onClick={() => onToggleDeactivate(row, false)}>Activate</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const handleSearch = (e: string) => {
    setSearch(e);
    setPage(1);
  };

  const onToggleDeactivate = (row: IAdminProfile, isDeactivating: boolean) => {
    setSelectedData(row);
    setReason("");
    if (isDeactivating) {
      setOpenDeactivate(true);
    } else {
      setOpenActivate(true);
    }
  };

  const onConfirmDeactivate = async () => {
    try {
      const res = await deactivateAdmin({ id: selectedData?.auth_user_id as string, reason: reason || undefined });
      if (res) {
        setOpenDeactivate(false);
        setSelectedData(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onConfirmActivate = async () => {
    try {
      if (!selectedData) return;
      const res = await updateAdmin({ id: selectedData.auth_user_id, data: { is_active: true, reason: reason || undefined } });
      if (res) {
        setOpenActivate(false);
        setSelectedData(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center w-full justify-end gap-2">
        <div className="flex flex-row items-center w-full gap-2 justify-end">
          {isManager && can("admin:create") && (
            <div>
              <Button className=" text-sm font-medium" onClick={() => router.push("admins/create")}>
                <CirclePlus /> Create New Admin
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Admin Management</h3>
            <p className="text-sm text-gray-500">View and manage admin and manager accounts.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={(e) => { setRoleFilter(e); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(e) => { setStatusFilter(e); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <SearchInput className="border-brand-100" onSearch={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={isLoading}
            actionOptions={actionOptions}
          />
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
      {openDeactivate && (
        <BaseDialogComponent
          title="Deactivate Account"
          isOpen={openDeactivate}
          onClose={() => {
            setOpenDeactivate(false);
            setSelectedData(null);
          }}
          onConfirm={onConfirmDeactivate}
          btnConfirm="Deactivate"
          isDisabled={deactivating}
          onCloseText="Cancel"
        >
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-500">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type the reason for deactivation..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </BaseDialogComponent>
      )}
      {openActivate && (
        <BaseDialogConfirmation
          image="success-edit"
          onCancel={() => {
            setOpenActivate(false);
            setSelectedData(null);
          }}
          open={openActivate}
          title="Activate Account?"
          subtitle="This account will be able to access the admin dashboard again."
          onConfirm={onConfirmActivate}
          cancelText="Cancel"
          confirmText="Activate"
        />
      )}
    </div>
  );
};
