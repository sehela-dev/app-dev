"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { CustomPagination } from "@/components/general/pagination-component";
import { DropdownFilter } from "@/components/general/table-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useEditClassCategory } from "@/hooks/api/mutations/admin";
import { useGetClassSessionsCategory } from "@/hooks/api/queries/admin/class-session";
import { formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IClassSessionCategory } from "@/types/class-category.interface";

import { CirclePlus, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const filterSections = [
  {
    title: "Type",
    options: [
      { id: "all", label: "All" },
      { id: "fix", label: "Fix" },
      { id: "percentage", label: "Percentage" },
    ],
  },
  {
    title: "Status",
    options: [
      { id: "all", label: "All" },
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
];

export const ClassListView = () => {
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useGetClassSessionsCategory({ page, limit, search });
  const [selectedValues, setSelectedValues] = useState({
    Type: "all",
    Status: "all",
  });
  const [selectedData, setSelectedData] = useState<IClassSessionCategory | null>(null);
  const [openNotif, setOpenNotif] = useState(false);
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false);

  const { mutateAsync: deleteClass } = useEditClassCategory();

  const handleSelectionChange = (section: string, optionId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [section]: optionId,
    }));
  };

  const onDelete = (data: IClassSessionCategory | null) => {
    setOpenDialogConfirm(!openDialogConfirm);
    setSelectedData(data);
  };

  const handleReset = () => {
    setSelectedValues({
      Type: "all",
      Status: "all",
    });
  };

  const headers = [
    {
      id: "class_name",
      text: "Class Name",
      value: "class_name",
    },
    {
      id: "class_description",
      text: "Description",
      value: "class_description",
    },
    {
      id: "allow_credit",
      text: "Credit Eligible",
      value: (row: IClassSessionCategory) => (row.allow_credit ? "Yes" : "No"),
    },
    // {
    //   id: "defaultCredits",
    //   text: "Default Credits",
    //   value: "defaultCredits",
    // },
    {
      id: "status",
      text: "Status",
      value: (row: IClassSessionCategory) => (
        <p className={row?.is_active ? "text-green-400" : "text-red-500"}>{row.is_active ? "Active" : "Inactive"}</p>
      ),
    },
    {
      id: "created_at",
      text: "Created Date",
      value: (row: IClassSessionCategory) => formatDateHelper(row.created_at, "dd/MM/yyyy H:mm"),
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
    render: (row: IClassSessionCategory) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => alert(row.id)}>Edit</DropdownMenuItem>
          {/* <DropdownMenuItem>Set as Inactive</DropdownMenuItem> */}
          <DropdownMenuItem
            className={cn({
              "text-red-500": row.is_active,
              "text-green-500": !row.is_active,
            })}
            onClick={() => onDelete(row)}
          >
            {row?.is_active ? "Set Inactive" : "Set Active"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const handleSearch = (e: string) => {
    setSearch(e);
  };

  const onConfirmDelete = async () => {
    try {
      const res = await deleteClass({
        id: selectedData?.id as string,
        data: {
          is_active: !selectedData?.is_active,
        },
      });
      if (res) {
        setOpenNotif(true);
        onDelete(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-row items-center w-full justify-end gap-2">
        <div>
          <DropdownFilter sections={filterSections} selectedValues={selectedValues} onSelectionChange={handleSelectionChange} onReset={handleReset} />
        </div>
        <div>
          <Button className=" text-sm font-medium" onClick={() => router.push("class/create")}>
            <CirclePlus /> Create New Class
          </Button>
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Class</h3>
            <p className="text-sm text-gray-500">Manage class types and credit rules</p>
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
          onCancel={() => onDelete(null)}
          open={openDialogConfirm}
          title={`Set ${selectedData?.is_active ? "Inactive" : "Active"} Class Category?`}
          subtitle="This class category will be set to inactive  from the system"
          onConfirm={onConfirmDelete}
          cancelText="Cancel"
          confirmText="Proceed"
        />
      )}

      {/* {openNotif && (
        <BaseDialogConfirmation
          image="trash-success"
          onCancel={() => onDelete(null)}
          hideCancel
          open={openNotif}
          title="Class Category Deleted Successfully"
          subtitle="Your credit package has been successfully removed from the system."
          onConfirm={() => {
            setOpenNotif(false);
            refetch();
          }}
          cancelText="Cancel"
          confirmText="Ok"
        />
      )} */}
    </div>
  );
};
