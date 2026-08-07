"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useDeleteLocation } from "@/hooks/api/mutations/admin";
import { useGetLocations } from "@/hooks/api/queries/admin/locations";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatDateHelper } from "@/lib/helper";
import { IRoomItem } from "@/types/room-location.interface";

import { CirclePlus, Ellipsis, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tab = [
  {
    name: "All",
    value: "all",
  },
  {
    name: "Active",
    value: "active",
  },
  {
    name: "Inactive",
    value: "inactive",
  },
];

export const LocationListView = () => {
  const { can } = useAdminPermission();
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedData, setSelectedData] = useState("");
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [tabs, setTabs] = useState("all");

  const { data, isLoading, refetch } = useGetLocations({
    page,
    limit,
    search,
    ...(tabs !== "all" ? { is_active: tabs === "active" } : null),
  });

  const { mutateAsync } = useDeleteLocation();

  const headers = [
    {
      id: "location_name",
      text: "Location Name",
      value: "name",
    },
    {
      id: "address",
      text: "Address",
      value: "address",
    },
    {
      id: "status",
      text: "Status",
      value: (row: IRoomItem) => <p className={row.is_active ? "text-green-400" : "text-red-500"}>{row.is_active ? "Active" : "Inactive"}</p>,
    },
    {
      id: "created_at",
      text: "Created Date",
      value: (row: IRoomItem) => formatDateHelper(row.created_at, "dd/MM/yyyy H:mm"),
    },
  ];

  const numberOptions = {
    text: "No",
    show: false,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IRoomItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {can("locations:update") && <DropdownMenuItem onClick={() => router.push(`locations/${row.id}/edit`)}>Edit</DropdownMenuItem>}
          {can("locations:detail") && <DropdownMenuItem onClick={() => router.push(`locations/${row.id}`)}>View Details</DropdownMenuItem>}
          {can("locations:delete") && (
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.id)}>
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const handleSearch = (e: string) => {
    setSearch(e);
  };

  const onDelete = (id: string) => {
    setOpenDialogConfirm(!openDialogConfirm);
    setSelectedData(id);
  };

  const onConfirmDelete = async () => {
    try {
      const res = await mutateAsync(selectedData);
      if (res) {
        setOpenNotif(true);
        onDelete("");
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
          <div>
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button>
          </div>
          {can("locations:create") && (
            <div>
              <Button className=" text-sm font-medium" onClick={() => router.push("locations/create")}>
                <CirclePlus /> Create New Location
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Location</h3>
            <p className="text-sm text-gray-500">View and manage the list of locations for your classes.</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <GeneralTabComponent tabs={tab} selecetedTab={tabs} setTab={setTabs} />
            <SearchInput className="border-brand-100" onSearch={handleSearch} />
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
      {openDialogConfirm && (
        <BaseDialogConfirmation
          image="trash-1"
          onCancel={() => onDelete("")}
          open={openDialogConfirm}
          title="Delete Location?"
          subtitle="This location will be permanently deleted from the system and cannot be restored."
          onConfirm={onConfirmDelete}
          cancelText="Cancel"
          confirmText="Delete"
        />
      )}
      {openNotif && (
        <BaseDialogConfirmation
          image="trash-success"
          onCancel={() => onDelete("")}
          hideCancel
          open={openNotif}
          title="Location Deleted Successfully"
          subtitle="Your location has been successfully removed from the system."
          onConfirm={() => {
            setOpenNotif(false);
            refetch();
          }}
          cancelText="Cancel"
          confirmText="Ok"
        />
      )}
    </div>
  );
};
