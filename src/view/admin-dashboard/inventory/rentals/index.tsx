"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { RentalDetailDialog } from "@/components/page/rentals/rental-detail-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetInventoryLocations } from "@/hooks/api/queries/admin/products";
import { useGetRentals } from "@/hooks/api/queries/admin/rentals";
import { IRentalItem, IRentalItemLine } from "@/types/rental.interface";
import { ArrowUpRight, CalendarRange, Eye, MapPinIcon, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SelectSearch, { SingleValue } from "react-select";

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "partially_returned", label: "Partially Returned" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

export const RentalRecordsPage = () => {
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data: locations, isLoading: locationLoading } = useGetInventoryLocations();
  const { data, isLoading } = useGetRentals({
    page,
    limit,
    status: status || undefined,
    ...(locationId ? { location_id: locationId } : null),
    ...(customer ? { customer } : null),
  });

  const locationOption = useMemo(
    () => (locations?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
    [locations],
  );

  const rows = useMemo(() => (data?.data as IRentalItem[] | undefined) ?? [], [data]);

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const getOrderText = (row: IRentalItem) => row.payment?.order_id ?? row.order_id ?? row.id;
  const getPaymentId = (row: IRentalItem) => row.payment?.id ?? row.payment_id ?? row.id;

  const handleViewDetail = (row: IRentalItem) => {
    setSelectedRentalId(row.id);
    setOpenDetail(true);
  };

  const headers = [
    {
      id: "order_id",
      text: "Order ID",
      value: (row: IRentalItem) => (
        <Link
          href={`/admin/orders/${getPaymentId(row)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-brand-500 hover:underline flex items-center gap-1 w-fit"
        >
          {getOrderText(row)}
          <ArrowUpRight size={14} />
        </Link>
      ),
    },
    {
      id: "customer",
      text: "Customer",
      value: (row: IRentalItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.customer_name ?? row.user?.full_name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{row.customer_phone ?? row.user?.phone}</p>
        </div>
      ),
    },
    {
      id: "items",
      text: "Items Rented",
      value: (row: IRentalItem) => {
        const items = (row.items ?? []) as IRentalItemLine[];
        if (items.length === 0) return <p className="text-muted-foreground">-</p>;
        return (
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 text-sm">
                <span className="font-medium text-foreground">{item.variant?.variant_name ?? item.order_item?.variant_name ?? "-"}</span>
                <span className="text-xs text-muted-foreground">x{item.quantity_rented ?? 0}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: IRentalItem) => <p className="capitalize">{row.payment?.provider ?? "-"}</p>,
    },
    {
      id: "location_name",
      text: "Location",
      value: (row: IRentalItem) => (
        <Badge variant="default">
          <MapPinIcon />  <p>{row.location?.name ?? row.location?.code ?? "-"}</p>
        </Badge>
      ),
    },
    {
      id: "status",
      text: "Status",
      value: (row: IRentalItem) => <Badge variant="secondary"><p className="capitalize">{row.status ?? "-"}</p></Badge>,
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IRentalItem) => (
      <Button variant="outline" size="sm" onClick={() => handleViewDetail(row)}>
        <Eye />
      </Button>
    ),
  };

  return (
    <Card className="rounded-lg border-brand-100">
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-brand-999 text-2xl font-semibold flex items-center gap-2">
            <PackageCheck size={24} />
            Rental Records
          </h3>
          <p className="text-sm text-gray-500 font-normal">View all product rental transactions</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="w-[220px]">
            <SearchInput
              className="border-brand-100"
              placeholder="Search customer..."
              search={customer}
              onSearch={(query) => {
                setCustomer(query);
                setPage(1);
              }}
            />
          </div>
          <div className="w-[200px]">
            <SelectSearch
              options={locationOption}
              isLoading={locationLoading}
              isClearable
              placeholder="Filter by location"
              className="text-sm"
              classNames={{
                control: () =>
                  "!border-2 !border-gray-200 rounded-lg text-gray-999 focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                placeholder: () => "placeholder-gray-400",
                singleValue: () => "text-brand-999",
                input: () => "text-brand-999 bg-none",
              }}
              onChange={(selected: SingleValue<{ value: string; label: string }>) => {
                setLocationId(selected?.value ?? "");
                setPage(1);
              }}
            />
          </div>
          <div className="w-[200px]">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <CalendarRange size={14} />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CustomTable data={rows} headers={headers} numberOptions={numberOptions} isLoading={isLoading} actionOptions={actionOptions} />
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

      {openDetail && selectedRentalId && (
        <RentalDetailDialog
          isOpen={openDetail}
          onClose={() => {
            setOpenDetail(false);
            setSelectedRentalId(null);
          }}
          rentalId={selectedRentalId}
        />
      )}
    </Card>
  );
};
