"use client";

import { CheckoutSessionCardComponent } from "@/components/general/checkout-session-card";
import { DialogSessionFilter } from "@/components/general/filter-dialog";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks";
import { useGetMySessions } from "@/hooks/api/queries/customer/profile";
import { formatDateHelper, getDurationInMinutes } from "@/lib/helper";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
  {
    name: "All",
    value: "all",
  },
  {
    name: "Upcoming",
    value: "upcoming",
  },
  {
    name: "Canceled",
    value: "cancelled",
  },
];

export const MySessionsPage = () => {
  const router = useRouter();
  const [selecetedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useGetMySessions({
    status: selecetedTab,
    page,
    limit: 8,
    search: debounceSearch,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const onExpoloreClass = () => {
    router.push("/book/class");
  };

  const onClickMySessionDetail = (id: string) => {
    router.push(`/profile/my-sessions/${id}`);
  };
  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="My Class" />

      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="mb-4 flex flex-col gap-2">
            <GeneralTabComponent
              variant="line"
              tabs={tabs}
              selecetedTab={selecetedTab}
              setTab={(e) => {
                setSelectedTab(e);
                setPage(1);
                refetch();
              }}
            />
            <div className="flex flex-row items-center justify-between gap-2">
              <SearchInput search={search} onSearch={handleSearch} />
              <DialogSessionFilter />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (data?.data?.length as number) > 0 ? (
            <div className="flex flex-col gap-4">
              <ScrollArea>
                {data?.data?.map((item) => (
                  <CheckoutSessionCardComponent
                    key={item.id}
                    duration={getDurationInMinutes(item?.class_session?.start_datetime, item?.class_session?.end_datetime)}
                    location={item?.class_session?.location_address}
                    date={formatDateHelper(item.class_session.start_datetime, "EEEE, dd MMM yyyy")}
                    time={formatDateHelper(item?.class_session?.start_datetime, "H:mm")}
                    title={item?.class_session?.session_name}
                    instructor={item?.class_session?.instructor_name}
                    isCancelled={item?.class_session?.status === "canceled"}
                    onClick={() => onClickMySessionDetail(item?.id)}
                  />
                ))}
              </ScrollArea>
              <CustomPagination
                onPageChange={(e) => {
                  setPage(e);
                }}
                currentPage={page}
                hasPrevPage={data?.pagination?.has_prev}
                hasNextPage={data?.pagination?.has_next}
                totalItems={data?.pagination?.total_items as number}
                totalPages={data?.pagination?.total_pages as number}
                limit={10}
                position="center"
              />
            </div>
          ) : (
            <EmptyStateSession action={onExpoloreClass} />
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyStateSession = ({ action }: { action: () => void }) => {
  return (
    <div className="w-full mx-auto flex flex-col items-center  min-h-[200px] justify-between">
      <div className="flex">
        <Image src={"/assets/alert/no-session.png"} alt="no-data" width={160} height={160} />
      </div>
      <div className="flex flex-col gap-2 justify-center items-center text-center">
        <p className="font-semibold">You haven’t joined any classes yet</p>
        <p>Start your learning journey today and grow your skills!</p>
        <div className="flex mb-4">
          <Button onClick={action}>Explore Classes</Button>
        </div>
      </div>
    </div>
  );
};
