"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useEditCustomer } from "@/hooks/api/mutations/admin";
import { useDeleteCustomer } from "@/hooks/api/mutations/admin/use-delete-customer";
import { useGetCustomers } from "@/hooks/api/queries/admin/customers";
import { ICustomerData } from "@/types/orders.interface";

import { CirclePlus, Ellipsis, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
  {
    value: "all",
    name: "All",
  },
  {
    value: "active",
    name: "Active",
  },

  {
    value: "inactive",
    name: "Inactive",
  },
];

export const CustomersPage = () => {
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const { data, isLoading, refetch } = useGetCustomers({
    page,
    limit,
    search,
    ...(tab !== "all" ? { status: tab === "active" ? "true" : "false" } : null),
  });
  const [selectedData, setSelectedData] = useState<ICustomerData | null>(null);
  const [openNotif, setOpenNotif] = useState(false);

  const [openDialogConfirm, setOpenDialogConfirm] = useState(false);
  const onDelete = (data: ICustomerData | null) => {
    setOpenDialogConfirm(!openDialogConfirm);
    setSelectedData(data);
  };
  const { mutateAsync } = useEditCustomer();

  const headers = [
    {
      id: "full_name",
      text: "Name",
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
    {
      id: "class_credit",
      text: "Class Credit",
      value: "class_credit",
    },

    // {
    //   id: "defaultCredits",
    //   text: "Default Credits",
    //   value: "defaultCredits",
    // },
    {
      id: "status",
      text: "Status",
      value: (row: ICustomerData) => <p className={row?.is_active ? "text-green-400" : "text-red-500"}>{row.is_active ? "Active" : "Inactive"}</p>,
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
    render: (row: ICustomerData) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => router.push(`member/${row.id}/edit`)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`member/${row.id}`)}>View Details</DropdownMenuItem>
          {/* <DropdownMenuItem>Set as Inactive</DropdownMenuItem> */}
          <DropdownMenuItem variant="destructive" className="" onClick={() => onDelete(row)}>
            Set as Inactive
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
      const payload = {
        is_active: !selectedData?.is_active as boolean,
      };
      const res = await mutateAsync({
        data: payload,
        id: selectedData?.id as string,
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
      <div className="flex flex-row items-center w-full justify-between gap-2">
        <div>{/* <GeneralTabComponent tabs={tabs} selecetedTab={tab} setTab={setTab} /> */}</div>
        <div className="flex flex-row items-center gap-2">
          <div>
            {/* <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button> */}
          </div>
          <div>
            <Button className=" text-sm font-medium" onClick={() => router.push("member/create")}>
              <CirclePlus /> Create New Member
            </Button>
          </div>
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Member</h3>
            <p className="text-sm text-gray-500 max-w-[80%]">
              Monitor member activity, attendance, and payment status to ensure a seamless experience.
            </p>
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
          title={`Set ${selectedData?.is_active ? "Inactive" : "Active"} Member?`}
          subtitle="This member will be set to Inactive from the system"
          onConfirm={onConfirmDelete}
          cancelText="Cancel"
          confirmText="Proceed"
        />
      )}
    </div>
  );
};
