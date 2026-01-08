"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks";
import { useGetCreditPackage } from "@/hooks/api/queries/admin/credit-package";

import { formatCurrency } from "@/lib/helper";
import { ICreditPackageItem } from "@/types/credit-package.interface";
import { IOrderItem } from "@/types/orders.interface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CirclePlus, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDeleteCreditPackage } from "@/hooks/api/mutations/admin";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { DropdownFilter } from "@/components/general/table-filter";
import { useGetClassSessionsCategory } from "@/hooks/api/queries/admin/class-session";

export const CreditPackagePageView = () => {
  const router = useRouter();
  // const [selecetedTab, setSelectedTab] = useState("week");
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false);
  const [selectedData, setSelectedData] = useState("");
  const [openNotif, setOpenNotif] = useState(false);
  const { mutateAsync } = useDeleteCreditPackage();
  const [selectedValues, setSelectedValues] = useState({
    Class: "all",
  });
  const { data: dataClass, isLoading: isLoadingClass } = useGetClassSessionsCategory({ page: 1, limit: 999, status: "true" });

  const onDelete = (id: string) => {
    setOpenDialogConfirm(!openDialogConfirm);
    setSelectedData(id);
  };

  const filterSections = useMemo(() => {
    const filter = [
      {
        title: "Class",
        options: [{ id: "all", label: "All" }],
      },
    ];

    if (!dataClass?.data) return filter;
    else {
      dataClass?.data.forEach((item) => {
        filter[0].options.push({
          id: item.id,
          label: item.class_name,
        });
      });
    }
    return filter;
  }, [dataClass?.data]);

  const handleSelectionChange = (section: string, optionId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [section]: optionId,
    }));
  };

  const handleReset = () => {
    setSelectedValues({
      Class: "all",
    });
  };

  const { data, isLoading, refetch } = useGetCreditPackage({ page, limit, search: debounceSearch });

  const numberOptions = {
    text: "No",
    show: false,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const headers = [
    {
      id: "name",
      text: "Package Name",
      value: "name",
    },
    {
      id: "description",
      text: "Description",
      value: (row: ICreditPackageItem) => <p className="max-w-[70%] flex-wrap text-wrap">{row?.description}</p>,
    },
    {
      id: "class_ids_restriction",
      text: "Class",
      value: (row: ICreditPackageItem) => (
        <p className="capitalize max-w-[70%] flex-wrap text-wrap">
          {row.class_ids_restriction?.length > 0 ? row?.class_ids_restriction.map((item) => item.name).join(", ") : "All Class"}
        </p>
      ),
    },
    {
      id: "credits",
      text: "Amount",
      value: (row: ICreditPackageItem) => <p>{row.credits} Credits</p>,
    },
    {
      id: "price_idr",
      text: "Regular Price",
      value: (row: ICreditPackageItem) => formatCurrency(row?.price_idr),
    },
    {
      id: "is_shareable",
      text: "Sharing",
      value: (row: ICreditPackageItem) => (row?.is_shareable ? "Yes" : "No"),
    },
    {
      id: "validity_days",
      text: "Valid for",
      value: (row: ICreditPackageItem) => <p>{row.validity_days} Days</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: ICreditPackageItem) => (
        <p className={row?.is_active ? "text-green-400 uppercase" : "text-red-500 uppercasex"}>{row?.is_active ? "Active" : "Inactive"}</p>
      ),
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IOrderItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => router.push(`credit-packages/${row.id}/edit`)}>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="" onClick={() => onDelete(row.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const onConfirmDelete = async () => {
    try {
      const res = await mutateAsync(selectedData);
      if (res) {
        setOpenNotif(true);
        onDelete("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between items-center">
        <div>{/* <GeneralTabComponent tabs={tabOptions} selecetedTab={selecetedTab} setTab={setSelectedTab} /> */}</div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex w-full">
            <DropdownFilter
              sections={filterSections}
              selectedValues={selectedValues}
              onSelectionChange={handleSelectionChange}
              onReset={handleReset}
            />
          </div>

          <div className="flex w-full">
            <Button className=" text-sm font-medium" onClick={() => router.push("credit-packages/create")}>
              <CirclePlus /> Add Credit Package
            </Button>
          </div>
        </div>
      </div>
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Credit Packages</h3>
            <p className="text-sm text-gray-500 font-normal">Credit package for the customer</p>
          </div>
          <div className="flex flex-row  gap-2">
            <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={isLoading || isLoadingClass}
            // setSelectedData={setSelectedData}
            // selectedData={selectedData}

            actionOptions={actionOptions}
          />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={(e) => {
              setPage(e);
            }}
            currentPage={page}
            showTotal
            hasPrevPage={data?.pagination?.has_prev}
            hasNextPage={data?.pagination?.has_next}
            totalItems={data?.pagination?.total_items as number}
            totalPages={data?.pagination?.total_pages as number}
            limit={limit}
          />
        </CardFooter>
      </Card>
      {openDialogConfirm && (
        <BaseDialogConfirmation
          image="trash-1"
          onCancel={() => onDelete("")}
          open={openDialogConfirm}
          title="Delete Credit Package?"
          subtitle="This credit package will be permanently deleted from the system and cannot be restored."
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
          title="Credit Package Deleted Successfully"
          subtitle="Your credit package has been successfully removed from the system."
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
