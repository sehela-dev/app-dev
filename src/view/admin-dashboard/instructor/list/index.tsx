"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useDeleteInstructor, useEditInstructor } from "@/hooks/api/mutations/admin";

import { useGetInstructor } from "@/hooks/api/queries/admin/instructor";
import { useAdminPermission } from "@/hooks/use-role-access";

import { ICreateIntructorPayload, IInstructorData } from "@/types/instructor.interface";

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

export const InstructorListPage = () => {
  const { can } = useAdminPermission();
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedData, setSelectedData] = useState("");
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false);
  const [openDialogStatus, setOpenDialogStatus] = useState(false);
  const [selectedStatusData, setSelectedStatusData] = useState<IInstructorData | null>(null);
  const [openNotif, setOpenNotif] = useState(false);
  const [tabs, setTabs] = useState("all");

  const { data, isLoading, refetch } = useGetInstructor({ page, limit, search, ...(tabs !== "all" ? { status: tabs } : null) });

  const { mutateAsync } = useDeleteInstructor();
  const { mutateAsync: editInstructor } = useEditInstructor();

  const headers = [
    {
      id: "instructor_name",
      text: "Instructor Name",
      value: "full_name",
    },
    {
      id: "phone",
      text: "WhatsApp",
      value: "phone",
    },
    {
      id: "email",
      text: "Email",
      value: "email",
    },
    // {
    //   id: "payment_method",
    //   text: "Payment Method",
    //   value: "payment_method",
    // },
    // {
    //   id: "shared_revenue",
    //   text: "Shared Revenue",
    //   value: "shared_revenue",
    // },

    {
      id: "status",
      text: "Status",
      value: (row: IInstructorData) => <p className={(row?.status === "active" ? "text-green-400" : "text-red-500") + " capitalize"}>{row.status}</p>,
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
    render: (row: IInstructorData) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {can("instructor:update") && <DropdownMenuItem onClick={() => router.push(`instructor/${row.id}/edit`)}>Edit</DropdownMenuItem>}
          {can("instructor:detail") && <DropdownMenuItem onClick={() => router.push(`instructor/${row.id}`)}>View Details</DropdownMenuItem>}

          {can("instructor:update") && (
            <DropdownMenuItem onClick={() => onToggleStatus(row)}>{row?.status === "active" ? "Set as Inactive" : "Set as Active"}</DropdownMenuItem>
          )}
          {can("instructor:delete") && (
            <DropdownMenuItem variant="destructive" className="" onClick={() => onDelete(row.id)}>
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const handleSearch = (e: string) => {
    setSearch(e);
    setPage(1);
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

  const onToggleStatus = (data: IInstructorData) => {
    setSelectedStatusData(data);
    setOpenDialogStatus(true);
  };

  const onConfirmToggleStatus = async () => {
    try {
      const payload = {
        status: selectedStatusData?.status === "active" ? "inactive" : "active",
      } as ICreateIntructorPayload;
      const res = await editInstructor({ data: payload, id: selectedStatusData?.id as string });
      if (res) {
        setOpenDialogStatus(false);
        setSelectedStatusData(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-row items-center w-full justify-end gap-2">
        {/* <div>
          <GeneralTabComponent tabs={tab} selecetedTab={tabs} setTab={setTabs} />
        </div> */}
        <div className="flex flex-row items-center w-full gap-2 justify-end">
          <div>
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button>
          </div>
          {can("instructor:create") && (
            <div>
              <Button className=" text-sm font-medium" onClick={() => router.push("instructor/create")}>
                <CirclePlus /> Create New Instructor
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Instructor</h3>
            <p className="text-sm text-gray-500">View and manage the list of instructors for your classes.</p>
          </div>
          <div className="flex">
            <SearchInput className="border-brand-100" onSearch={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={isLoading}
            // setSelectedData={setSelectedData}
            // selectedData={selectedData}

            actionOptions={actionOptions}
          />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={(e) => setPage(e)}
            currentPage={page}
            showTotal
            // nextPage={data?.pagination?.}
            hasNextPage={data?.pagination?.has_next}
            hasPrevPage={data?.pagination?.has_prev}
            // previousPage={data?.pagination?.previousPage}
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
          title="Delete Instructor?"
          subtitle="This instructor will be permanently deleted from the system and cannot be restored."
          onConfirm={onConfirmDelete}
          cancelText="Cancel"
          confirmText="Delete"
        />
      )}
      {openDialogStatus && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => {
            setOpenDialogStatus(false);
            setSelectedStatusData(null);
          }}
          open={openDialogStatus}
          title={`Set ${selectedStatusData?.status === "active" ? "Inactive" : "Active"} Instructor?`}
          subtitle="The instructor status will be updated accordingly."
          onConfirm={onConfirmToggleStatus}
          cancelText="Cancel"
          confirmText="Proceed"
        />
      )}
      {openNotif && (
        <BaseDialogConfirmation
          image="trash-success"
          onCancel={() => onDelete("")}
          hideCancel
          open={openNotif}
          title="Instructor Deleted Successfully"
          subtitle="Your instructor has been successfully removed from the system."
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
