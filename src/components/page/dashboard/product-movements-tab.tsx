"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { DateRangePicker } from "@/components/base/date-range-picker";
import { useGetInventoryLocations, useGetProductMovements } from "@/hooks/api/queries/admin/products";
import { formatDateHelper } from "@/lib/helper";
import { IProductMovement, IProductVariantItem } from "@/types/product.interface";
import { History } from "lucide-react";
import { useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  initial_stock: "Initial Stock",
  adjustment: "Adjustment",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  sale_checkout: "Sale Checkout",
  rental_checkout: "Rental Checkout",
  rental_return: "Rental Return",
  rental_cancellation_release: "Rental Cancellation Release",
  sale_cancellation: "Sale Cancellation",
  rental_void_release: "Rental Void Release",
};

const MOVEMENT_TYPE_STYLES: Record<string, string> = {
  initial_stock: "bg-blue-500/10 text-blue-500",
  adjustment: "bg-yellow-500/10 text-yellow-500",
  transfer_in: "bg-teal-500/10 text-teal-500",
  transfer_out: "bg-purple-500/10 text-purple-500",
  sale_checkout: "bg-emerald-500/10 text-emerald-500",
  rental_checkout: "bg-indigo-500/10 text-indigo-500",
  rental_return: "bg-green-500/10 text-green-500",
  rental_cancellation_release: "bg-orange-500/10 text-orange-500",
  sale_cancellation: "bg-red-500/10 text-red-500",
  rental_void_release: "bg-gray-500/10 text-gray-500",
};

interface IProps {
  productId: string;
  variants: IProductVariantItem[];
}

type SelectOption = { value: string; label: string };

const selectClassNames = {
  control: () =>
    "!border-2 !border-gray-200 rounded-lg text-gray-999 focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
  placeholder: () => "placeholder-gray-400",
  singleValue: () => "text-brand-999",
  input: () => "text-brand-999 bg-none",
};

export const ProductMovementsTab = ({ productId, variants }: IProps) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [variantId, setVariantId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [referenceType, setReferenceType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: locations, isLoading: locationLoading } = useGetInventoryLocations();
  const { data, isLoading } = useGetProductMovements(productId, {
    page,
    limit,
    ...(variantId ? { variant_id: variantId } : null),
    ...(locationId ? { location_id: locationId } : null),
    ...(referenceType ? { reference_type: referenceType } : null),
    ...(startDate ? { start_date: startDate } : null),
    ...(endDate ? { end_date: endDate } : null),
  });

  const variantOption = useMemo<SelectOption[]>(
    () => (variants ?? []).map((v) => ({ value: v.id, label: `${v.variant_name} (${v.sku})` })),
    [variants],
  );

  const locationOption = useMemo<SelectOption[]>(
    () => (locations?.data ?? []).map((l) => ({ value: l.id, label: l.name })),
    [locations],
  );

  const referenceTypeOption = useMemo<SelectOption[]>(() => {
    const types = [...new Set((data?.data ?? []).map((m) => m.reference_type).filter(Boolean))];
    return types.map((t) => ({ value: t, label: t }));
  }, [data]);

  const handleFilterChange = (setter: (value: string) => void) => (selected: SingleValue<SelectOption>) => {
    setter(selected?.value ?? "");
    setPage(1);
  };

  const handleDateRangeChange = (from: string, to?: string) => {
    setStartDate(from);
    setEndDate(to ?? "");
    setPage(1);
  };

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const headers = [
    {
      id: "created_at",
      text: "Date",
      value: (row: IProductMovement) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{formatDateHelper(row.created_at, "dd/MM/yyyy")}</p>
          <p className="text-xs text-muted-foreground">{formatDateHelper(row.created_at, "HH:mm")}</p>
        </div>
      ),
    },
    {
      id: "variant",
      text: "Variant",
      value: (row: IProductMovement) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.variant?.variant_name}</p>
          <p className="text-xs text-muted-foreground">SKU: {row.variant?.sku}</p>
        </div>
      ),
    },
    {
      id: "location",
      text: "Location",
      value: (row: IProductMovement) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.location?.name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{row.location?.code}</p>
        </div>
      ),
    },
    {
      id: "movement_type",
      text: "Movement Type",
      value: (row: IProductMovement) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${MOVEMENT_TYPE_STYLES[row.movement_type] ?? "bg-gray-500/10 text-gray-500"}`}
        >
          {MOVEMENT_TYPE_LABELS[row.movement_type] ?? row.movement_type}
        </div>
      ),
    },
    {
      id: "reference_type",
      text: "Reference",
      value: (row: IProductMovement) => (
        <span className="capitalize text-sm">{row.reference_type?.replace(/_/g, " ") ?? "-"}</span>
      ),
    },
    {
      id: "quantity_delta_total",
      text: "Qty",
      value: (row: IProductMovement) => {
        const delta = Number(row.quantity_delta_rented ?? 0) !== 0 ? row.quantity_delta_rented : row.quantity_delta_total;
        const raw = Number(delta ?? 0);
        const abs = Math.abs(raw);
        const isReturn = ["rental_return", "rental_cancellation_release", "rental_void_release"].includes(row.movement_type);
        const isCheckout = ["rental_checkout"].includes(row.movement_type);
        const value = isReturn ? abs : isCheckout ? -abs : raw;
        return <span className={`font-semibold ${value >= 0 ? "text-emerald-500" : "text-red-500"}`}>{value >= 0 ? `+${value}` : `${value}`}</span>;
      },
    },
    {
      id: "reference_id",
      text: "Reference ID",
      value: (row: IProductMovement) => (
        <span className="text-sm text-muted-foreground font-mono">{row.reference_id?.slice(0, 8) ?? "-"}</span>
      ),
    },
    {
      id: "actor",
      text: "Actor",
      value: (row: IProductMovement) =>
        row.actor ? (
          <div className="flex flex-col">
            <p className="font-medium text-foreground">{row.actor.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{row.actor.role}</p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">System</span>
        ),
    },
    {
      id: "note",
      text: "Note",
      value: (row: IProductMovement) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">{row.note || "-"}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2 flex-wrap">
        <div className="w-[240px]">
          <Select
            options={variantOption}
            isClearable
            placeholder="Filter by variant"
            className="text-sm"
            classNames={selectClassNames}
            onChange={handleFilterChange(setVariantId)}
          />
        </div>
        <div className="w-[240px]">
          <Select
            options={locationOption}
            isLoading={locationLoading}
            isClearable
            placeholder="Filter by location"
            className="text-sm"
            classNames={selectClassNames}
            onChange={handleFilterChange(setLocationId)}
          />
        </div>
        <div className="w-[240px]">
          <Select
            options={referenceTypeOption}
            isClearable
            placeholder="Filter by reference type"
            className="text-sm"
            classNames={selectClassNames}
            onChange={handleFilterChange(setReferenceType)}
          />
        </div>
        <div className="w-[280px]">
          <DateRangePicker startDate={startDate} endDate={endDate} onDateRangeChange={handleDateRangeChange} />
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        <History size={18} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading movement history..." : `${data?.pagination?.total_items ?? 0} movement record(s) found`}
        </p>
      </div>

      <CustomTable data={data?.data ?? []} headers={headers} numberOptions={numberOptions} isLoading={isLoading} />

      <div className="flex w-full">
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
      </div>
    </div>
  );
};
