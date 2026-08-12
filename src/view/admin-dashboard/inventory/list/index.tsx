"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { ManageStockDialog } from "@/components/page/dashboard/manage-stock-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useGetInventoryList, useGetInventoryLocations } from "@/hooks/api/queries/admin/products";
import { IInventorySnapshotItem, IStockableVariant } from "@/types/product.interface";
import { PackageSearch, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

export const InventoryListPage = () => {
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState<string>("");
  const [openManageStock, setOpenManageStock] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<IStockableVariant | null>(null);

  const { data: locations, isLoading: locationLoading } = useGetInventoryLocations();
  const { data, isLoading, refetch } = useGetInventoryList({ page, limit, location_id: locationId || undefined });

  useEffect(() => {
    setPage(1);
  }, [locationId]);

  const locationOption = useMemo(() => {
    return (locations?.data ?? []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [locations]);

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const handleManageStock = (row: IInventorySnapshotItem) => {
    const rows = (data?.data ?? []).filter((r) => r.product_variant_id === row.product_variant_id);
    const variant: IStockableVariant = {
      id: row.product_variant_id,
      product_id: row.variant.product_id,
      variant_name: row.variant.variant_name,
      sku: row.variant.sku,
      price_idr: row.variant.price_idr,
      inventory: rows.map((r) => ({
        id: r.id,
        location_id: r.location_id,
        location: r.location,
        stock_total: r.stock_total,
        stock_rented: r.stock_rented,
        stock_available: r.stock_available,
      })),
    };
    setSelectedVariant(variant);
    setOpenManageStock(true);
  };

  const getStockStatus = (available: number, total: number) => {
    if (!total || available === 0) return "bg-red-500/10 text-red-400";
    if (available < total * 0.25) return "bg-yellow-500/10 text-yellow-400";
    return "bg-emerald-500/10 text-emerald-400";
  };

  const getStatusBadge = (available: number, total: number) => {
    if (!total || available === 0) return "Out of Stock";
    if (available < total * 0.25) return "Low Stock";
    return "In Stock";
  };

  const headers = [
    {
      id: "product",
      text: "Product",
      value: (row: IInventorySnapshotItem) => row.variant.product?.name ?? "-",
    },
    {
      id: "variant",
      text: "Variant",
      value: (row: IInventorySnapshotItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.variant.variant_name}</p>
          <p className="text-xs text-muted-foreground">SKU: {row.variant.sku}</p>
        </div>
      ),
    },
    {
      id: "location",
      text: "Location",
      value: (row: IInventorySnapshotItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.location?.name}</p>
          <p className="text-xs text-muted-foreground">{row.location?.code}</p>
        </div>
      ),
    },
    {
      id: "stock_total",
      text: "Total Stock",
      value: (row: IInventorySnapshotItem) => String(row.stock_total ?? 0),
    },
    {
      id: "stock_rented",
      text: "Rented",
      value: (row: IInventorySnapshotItem) => String(row.stock_rented ?? 0),
    },
    {
      id: "stock_available",
      text: "Available",
      value: (row: IInventorySnapshotItem) => String(row.stock_available ?? 0),
    },

    {
      id: "status",
      text: "Status",
      value: (row: IInventorySnapshotItem) => (
        <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getStockStatus(row.stock_available, row.stock_total)}`}>
          {getStatusBadge(row.stock_available, row.stock_total)}
        </div>
      ),
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IInventorySnapshotItem) => (
      <Button variant="default" size="sm" onClick={() => handleManageStock(row)}>
        <Warehouse /> Manage Stock
      </Button>
    ),
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold flex items-center gap-2">
              <PackageSearch size={24} />
              Inventory Management
            </h3>
            <p className="text-sm text-gray-500 font-normal">View and manage stock availability across all locations</p>
          </div>
          <div className="flex flex-row items-center gap-2 w-[320px]">
            <Select
              options={locationOption}
              isLoading={locationLoading}
              isClearable
              placeholder="Filter by location"
              className="w-full text-sm"
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
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={isLoading}
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
      {openManageStock && (
        <ManageStockDialog
          isOpen={openManageStock}
          onClose={() => {
            setOpenManageStock(false);
            setSelectedVariant(null);
          }}
          selectedVariant={selectedVariant}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};