"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { sampleOrders } from "@/constants/sample-data";
import { classesResponse, IClassCategoryData } from "@/types/class-category.interface";
import { CirclePlus, Ellipsis, ListFilter } from "lucide-react";
import { useState } from "react";

export const ClassListView = () => {
  const [selecetedTab, setSelectedTab] = useState("week");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const headers = [
    {
      id: "className",
      text: "Class Name",
      value: "className",
    },
    {
      id: "description",
      text: "Description",
      value: "description",
    },
    {
      id: "creditEligible",
      text: "Credit Eligible",
      value: (row: IClassCategoryData) => (row.creditEligible ? "Yes" : "No"),
    },
    // {
    //   id: "defaultCredits",
    //   text: "Default Credits",
    //   value: "defaultCredits",
    // },
    {
      id: "status",
      text: "Status",
      value: (row: IClassCategoryData) => <p className={row?.status === "Active" ? "text-green-400" : "text-red-500"}>{row.status}</p>,
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
    render: (row: IClassCategoryData) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Set as Inactive</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-row items-center w-full justify-end gap-2">
        <div>
          <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
            <ListFilter /> Filter
          </Button>
        </div>
        <div>
          <Button className=" text-sm font-medium">
            <CirclePlus /> Create New Class
          </Button>
        </div>
      </div>
      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Orders</h3>
            <p className="text-sm text-gray-500">Order summary and total bill</p>
          </div>
          <div className="flex">
            <SearchInput className="border-brand-100" />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={classesResponse.data}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={false}
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
            nextPage={sampleOrders?.pagination?.nextPage}
            hasNextPage={sampleOrders?.pagination?.hasNextPage}
            hasPrevPage={sampleOrders?.pagination?.hasPrevPage}
            previousPage={sampleOrders?.pagination?.previousPage}
            totalItems={sampleOrders?.pagination?.totalItems as number}
            totalPages={sampleOrders?.pagination?.totalPages as number}
            limit={10}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
