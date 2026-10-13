/* eslint-disable @next/next/no-img-element */
"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

import { SearchInput } from "@/components/ui/search-input";

import { useDeleteProduct, useUpdateProduct } from "@/hooks/api/mutations/admin";
import { useGetProductCategories, useGetProductList } from "@/hooks/api/queries/admin/products";
import { downloadCsvBlob, exportProductMasterCsv } from "@/api-req/products";

import { formatDateHelper } from "@/lib/helper";
import { IProductItemList } from "@/types/product.interface";
import { CirclePlus, Download, Ellipsis, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import { toast } from "sonner";

const tabOption = [
  {
    name: "For Sell",
    value: "false",
  },
  {
    name: "For Rent",
    value: "true",
  },
];

export const ProductListPage = () => {
  const router = useRouter();
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("false");
  const [categoryId, setCategoryId] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<IProductItemList | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, refetch } = useGetProductList({
    page,
    limit,
    search,
    is_rentable: tab,
    ...(categoryId ? { category_id: categoryId } : null),
    ...(includeInactive ? { include_inactive: true } : null),
  });
  const { data: categories } = useGetProductCategories({ page: 1, limit: 999 });
  const { mutateAsync: deleteAsync } = useDeleteProduct();
  const { mutateAsync: updateAsync } = useUpdateProduct();

  const categoryOption = useMemo(
    () => (categories?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleToggleActive = async (row: IProductItemList) => {
    const payload = new FormData();
    payload.append("is_active", String(!row.is_active));
    await updateAsync({ id: row.id, payload });
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAsync(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportProductMasterCsv({
        search,
        is_rentable: tab,
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(includeInactive ? { include_inactive: true } : {}),
      });
      downloadCsvBlob(blob, `product_master_${tab === "true" ? "rent" : "sell"}.csv`);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Gagal export CSV");
    } finally {
      setExporting(false);
    }
  };

  const headers = [
    {
      id: "name",
      text: "Name",
      value: (row: IProductItemList) => <div className="flex flex-row items-center gap-4">
        <div className="flex h-16 w-16 border border-gray-200 bg-gray-200 rounded-md">
          <img src={row.photos?.[0]} alt={row.name} className="h-16 w-16" />
        </div>
        <p>{row?.name}</p>
      </div>,
    },
    {
      id: "category",
      text: "Category",
      value: (row: IProductItemList) => row?.category.name,
    },
    {
      id: "status",
      text: "Status",
      value: (row: IProductItemList) => (
        <div className={`grid col-span-9 capitalize ${row?.is_active ? `text-green-500` : `text-red-500`}`}>
          {row.is_active ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      id: "variant_count",
      text: "Variants",
      value: "variant_count",
    },
    {
      id: "total_stock",
      text: "Stock Available",
      value: "stock_available",
    },
    {
      id: "created_at",
      text: "Created At",
      value: (row: IProductItemList) => formatDateHelper(row.created_at, "dd/MM/yyyy H:mm"),
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IProductItemList) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => router.push(`products/${row.id}`)}>View Details</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleActive(row)}>
            {row.is_active ? "Set as Inactive" : "Set as Active"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between items-center">
        <div></div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="outline" className="text-sm font-medium" disabled={exporting} onClick={handleExport}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </Button>
          <div className="flex w-full">
            <Button className=" text-sm font-medium" onClick={() => router.push("products/create")}>
              <CirclePlus /> Add Products
            </Button>
          </div>
        </div>
      </div>
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Products</h3>
            <p className="text-sm text-gray-500 font-normal">Manage your products and view their sales performance</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="flex w-full items-center gap-2 text-sm text-gray-500">
              <Switch checked={includeInactive} onCheckedChange={(v) => { setIncludeInactive(v); setPage(1); }} />
              <span>
                Show inactive
              </span>
            </div>
            <div className="flex w-full">
              <Select
                options={categoryOption}
                isClearable
                placeholder="Filter by category"
                className="text-sm"
                onChange={(selected: SingleValue<{ value: string; label: string }>) => {
                  setCategoryId(selected?.value ?? "");
                  setPage(1);
                }}
              />
            </div>

            <div className="flex w-full">

              <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="max-w-auto">
            <GeneralTabComponent
              selecetedTab={tab}
              setTab={(e) => {
                setTab(e);
              }}
              tabs={tabOption}
            />
          </div>
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
      {deleteTarget && (
        <BaseDialogComponent
          title="Delete Product"
          isOpen={!!deleteTarget}
          btnConfirm="Delete"
          onCloseText="Cancel"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        >
          <p className="text-sm text-gray-500">
            Delete <span className="font-semibold text-foreground">{deleteTarget.name}</span> and all its variants? This cannot be undone.
          </p>
        </BaseDialogComponent>
      )}
    </div>
  );
};
