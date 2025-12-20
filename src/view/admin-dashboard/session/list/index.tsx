"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useGetSessions } from "@/hooks/api/queries/admin/class-session";
import { formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IClassSessionCategory } from "@/types/class-category.interface";
import { ISessionItem } from "@/types/class-sessions.interface";

import { CirclePlus, Ellipsis, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tabFilter = [
  {
    value: "all",
    name: "All",
  },
  {
    value: "scheduled",
    name: "Scheduled",
  },

  {
    value: "ongoing",
    name: "On Going",
  },
  {
    value: "ended",
    name: "Ended",
  },
  {
    value: "canceled",
    name: "Canceled",
  },
];

export const SessionListPage = () => {
  const router = useRouter();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tabCustomer, setTabCustomer] = useState("all");
  const { data, isLoading, refetch } = useGetSessions({ page, limit, search, status: tabCustomer !== "all" ? tabCustomer : "" });

  const headers = [
    {
      id: "session_name",
      text: "Session Name",
      value: "session_name",
    },
    {
      id: "class",
      text: "Class",
      value: (row: ISessionItem) => row.class.class_name,
    },
    {
      id: "capacity",
      text: "Capacity",
      value: (row: ISessionItem) => String(row.capacity),
    },
    {
      id: "start_date",
      text: "Date",
      value: (row: ISessionItem) => formatDateHelper(row.start_date, "dd/MM/yyyy"),
    },
    {
      id: "instructor",
      text: "Instructor",
      value: "instructor_name",
    },
    {
      id: "time",
      text: "Time",
      value: "time_start",
    },
    {
      id: "location",
      text: "Location",
      value: (row: ISessionItem) => <p className="capitalize">{row.place === "offline" ? row.location : row.place}</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: ISessionItem) => (
        <p
          className={cn("capitalize font-semibold", {
            "text-green-500": row.status === "ongoing",
            "text-blue-500": row.status === "scheduled",
            "text-red-500": row.status === "ended",
            "text-yellow-500": row.status === "canceled",
          })}
        >
          {row.status}
        </p>
      ),
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
    render: (row: ISessionItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuItem onClick={() => alert(row.id)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`session/${row.id}`)}>View Details</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="" onClick={() => alert(row.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const handleSearch = (e: string) => {
    setSearch(e);
  };

  return (
    <div className="flex w-full  flex-col gap-2">
      <div className="flex flex-row justify-between w-full items-center">
        <div>
          <GeneralTabComponent
            selecetedTab={tabCustomer}
            setTab={(e) => {
              setTabCustomer(e);
              setSearch("");
              setPage(1);
              refetch();
            }}
            tabs={tabFilter}
          />
        </div>
        <div className="flex flex-row items-center w-full justify-end gap-2">
          <div>
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button>
          </div>
          <div>
            <Button className=" text-sm font-medium" onClick={() => router.push("session/create")}>
              <CirclePlus /> Create New Session
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-brand-100 w-full">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Sessions</h3>
            <p className="text-sm text-gray-500">Manage class schedules and sessions</p>
          </div>
          <div className="flex">
            <SearchInput className="border-brand-100" onSearch={handleSearch} search={search} />
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
    </div>
  );
};
