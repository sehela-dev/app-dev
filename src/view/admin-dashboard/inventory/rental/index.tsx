"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks";
import { useGetProductList } from "@/hooks/api/queries/admin/products";
import { formatCurrency } from "@/lib/helper";
import { IProductVariantItem } from "@/types/product.interface";
import { PackageCheck, MapPin, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export const ProductRentalTabPage = () => {
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetProductList({
    page,
    limit,
    is_rentable: "true",
    view: "variants",
    search: debounceSearch,
  });

  const rows = useMemo(() => (data?.data as IProductVariantItem[] | undefined) ?? [], [data]);

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const getRentalStatus = (availableToRent: number, total: number) => {
    if (!total || availableToRent === 0) return "bg-red-500/10 text-red-400";
    if (availableToRent < total * 0.25) return "bg-yellow-500/10 text-yellow-400";
    return "bg-emerald-500/10 text-emerald-400";
  };

  const getStatusBadge = (availableToRent: number, total: number) => {
    if (!total || availableToRent === 0) return "Out for Rent";
    if (availableToRent < total * 0.25) return "Low Availability";
    return "Available";
  };

  const headers = [
    {
      id: "product_name",
      text: "Product",
      value: (row: IProductVariantItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.product_name}</p>
          <p className="text-xs text-muted-foreground">{row.variant_name}</p>
        </div>
      ),
    },
    {
      id: "sku",
      text: "SKU",
      value: (row: IProductVariantItem) => (
        <p className="text-sm text-muted-foreground font-mono">{row.sku}</p>
      ),
    },
    {
      id: "price_idr",
      text: "Rental Price",
      value: (row: IProductVariantItem) => (
        <p className="font-medium text-foreground">{formatCurrency(row.price_idr)}</p>
      ),
    },
    {
      id: "inventory",
      text: "Stock by Location",
      value: (row: IProductVariantItem) => (
        <div className="flex flex-col gap-1">
          {(row.inventory ?? []).map((inv) => (
            <div key={inv.id} className="flex flex-row items-center gap-1.5 text-xs">
              <MapPin size={12} className="text-gray-400 shrink-0" />
              <span className="font-medium text-foreground">{inv.location?.name}:</span>
              <span className="text-muted-foreground">{inv.stock_available_to_rent} to rent</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "stock_available_to_rent",
      text: "Available to Rent",
      value: (row: IProductVariantItem) => (
        <p className="font-semibold text-foreground">{row.stock_available_to_rent ?? 0}</p>
      ),
    },
    {
      id: "stock_rented",
      text: "Rented Out",
      value: (row: IProductVariantItem) => (
        <p className="text-muted-foreground">{row.stock_rented ?? 0}</p>
      ),
    },
    {
      id: "stock_total",
      text: "Total Stock",
      value: (row: IProductVariantItem) => (
        <p className="text-muted-foreground">{row.stock_total ?? 0}</p>
      ),
    },
    {
      id: "status",
      text: "Status",
      value: (row: IProductVariantItem) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getRentalStatus(
            row.stock_available_to_rent ?? 0,
            row.stock_total ?? 0,
          )}`}
        >
          {getStatusBadge(row.stock_available_to_rent ?? 0, row.stock_total ?? 0)}
        </div>
      ),
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IProductVariantItem) => (
      <Button variant="default" size="sm" onClick={() => router.push(`/admin/products/${row.product_id}`)}>
        <ArrowRightLeft /> View Product
      </Button>
    ),
  };

  return (
    <Card className="rounded-lg border-brand-100">
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-brand-999 text-2xl font-semibold flex items-center gap-2">
            <PackageCheck size={24} />
            Product Rental
          </h3>
          <p className="text-sm text-gray-500 font-normal">View rental availability of products across all locations</p>
        </div>
        <div className="flex flex-row items-center gap-2 w-[320px]">
          <SearchInput className="border-brand-100" search={search} onSearch={(e) => { setSearch(e); setPage(1); }} />
        </div>
      </CardHeader>
      <CardContent>
        <CustomTable
          data={rows}
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
  );
};
