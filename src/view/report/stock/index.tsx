"use client";

import {
  buildStockReportCsv,
  downloadCsvBlob,
  exportInventorySnapshotCsv,
  getCategoryNameByProductId,
  getStockReportRows,
  stockReportFilename,
  toCsvBlob,
  type IStockReportRow,
} from "@/api-req/products";
import { BackButtonComponent } from "@/components/general/back-button";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { ProductMovementsTab } from "@/components/page/dashboard/product-movements-tab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { useGetInventoryList, useGetInventoryLocations, useGetProductCategories } from "@/hooks/api/queries/admin/products";
import { cn } from "@/lib/utils";
import type { IInventorySnapshotItem, IProductVariantItem } from "@/types/product.interface";
import { useQuery } from "@tanstack/react-query";
import { Boxes, CircleCheck, Download, History, Loader2, MapPin, Package, Tag, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
import { toast } from "sonner";

type SelectOption = { value: string; label: string };
type HistoryTarget = {
  productId: string;
  productName: string;
  locationName: string;
  variant: IProductVariantItem;
} | null;

const tabOptions = [
  { name: "Stok", value: "stock" },
  { name: "Inventory per-lokasi", value: "inventory" },
];

const selectClass = "text-sm";
const idr = new Intl.NumberFormat("id-ID");

// Merah saat kosong, amber saat <25%, hijau selebihnya (sama dengan Inventory list).
const stockTone = (available: number, total: number) =>
  !total || available <= 0
    ? "border-red-200 bg-red-50 text-red-600"
    : available < total * 0.25
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-green-200 bg-green-50 text-green-700";

const stockLabel = (available: number, total: number) =>
  !total || available <= 0 ? "Empty" : available < total * 0.25 ? "Low" : "In stock";

export const StockReportView = () => {
  const [tab, setTab] = useState("stock");

  // --- Tab Stok: filter bar (q + location difilter client-side, BE abaikan) ---
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rentable, setRentable] = useState<"all" | "true" | "false">("all");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [locationCode, setLocationCode] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [exportingStock, setExportingStock] = useState(false);
  const [history, setHistory] = useState<HistoryTarget>(null);
  const stockLimit = 20;

  // --- Tab Inventory: filter server-side ---
  const [invQ, setInvQ] = useState("");
  const [invLocationId, setInvLocationId] = useState("");
  const [invPage, setInvPage] = useState(1);
  const [exportingInv, setExportingInv] = useState(false);
  const invLimit = 20;

  const { data: categories } = useGetProductCategories({ page: 1, limit: 999 });
  const { data: locations } = useGetInventoryLocations();

  const categoryOption = useMemo<SelectOption[]>(
    () => (categories?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );
  const locationOption = useMemo<SelectOption[]>(
    () => (locations?.data ?? []).map((l) => ({ value: l.code, label: `${l.name} (${l.code})` })),
    [locations],
  );
  const invLocationOption = useMemo<SelectOption[]>(
    () => (locations?.data ?? []).map((l) => ({ value: l.id, label: `${l.name} (${l.code})` })),
    [locations],
  );

  const stockParams = useMemo(
    () => ({
      ...(q ? { q } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(rentable !== "all" ? { is_rentable: rentable } : {}),
      ...(includeInactive ? { include_inactive: true } : {}),
      ...(locationCode ? { location_code: locationCode } : {}),
    }),
    [q, categoryId, rentable, includeInactive, locationCode],
  );

  // Fetch semua halaman sekali (page_size=100 loop di getStockReportRows),
  // preview paginasi client-side 20/baris, export pakai rows yang sama.
  const stockQuery = useQuery({
    queryKey: ["report", "stock", stockParams],
    queryFn: () => getStockReportRows(stockParams),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const stockRows = useMemo(() => stockQuery.data ?? [], [stockQuery.data]);
  const stockPageRows = useMemo(
    () => stockRows.slice((stockPage - 1) * stockLimit, stockPage * stockLimit),
    [stockRows, stockPage],
  );

  // Ringkasan dari rows yang sudah full (tanpa fetch tambahan).
  const summary = useMemo(() => {
    let units = 0;
    let available = 0;
    let rented = 0;
    let low = 0;
    for (const r of stockRows) {
      units += r.stock_total;
      available += r.stock_available;
      rented += r.stock_rented;
      if (r.stock_available <= 0 || (r.stock_total > 0 && r.stock_available < r.stock_total * 0.25)) low += 1;
    }
    return { variants: new Set(stockRows.map((r) => r.variant_id)).size, units, available, rented, low };
  }, [stockRows]);

  const invQuery = useGetInventoryList({
    page: invPage,
    limit: invLimit,
    ...(invLocationId ? { location_id: invLocationId } : {}),
    ...(invQ ? { q: invQ } : {}),
  });

  // Map kategori untuk badge Category di tab Inventory (datanya tak bawa category).
  // Hanya di-fetch saat tab inventory dibuka.
  const categoryMapQuery = useQuery({
    queryKey: ["report", "stock", "category-map"],
    queryFn: getCategoryNameByProductId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: tab === "inventory",
  });
  const categoryNameOf = (productId?: string) => (productId ? (categoryMapQuery.data?.get(productId) ?? "") : "");

  const resetStockPage = () => setStockPage(1);

  const handleExportStock = async () => {
    try {
      setExportingStock(true);
      const rows = stockQuery.data ?? (await getStockReportRows(stockParams));
      downloadCsvBlob(
        toCsvBlob(buildStockReportCsv(rows)),
        stockReportFilename({
          ...(locationCode ? { location_code: locationCode } : {}),
          ...(rentable !== "all" ? { is_rentable: rentable } : {}),
          ...(includeInactive ? { include_inactive: true } : {}),
        }),
      );
      toast.success(rows.length === 0 ? "CSV downloaded (no data)" : "CSV downloaded");
    } catch {
      toast.error("Gagal export CSV");
    } finally {
      setExportingStock(false);
    }
  };

  const handleExportInv = async () => {
    try {
      setExportingInv(true);
      const blob = await exportInventorySnapshotCsv({
        ...(invLocationId ? { location_id: invLocationId } : {}),
        ...(invQ ? { q: invQ } : {}),
      });
      const code = locations?.data?.find((l) => l.id === invLocationId)?.code?.toLowerCase() ?? "";
      const date = new Date().toISOString().slice(0, 10);
      downloadCsvBlob(blob, `inventory_${code ? `${code}_` : ""}${date}.csv`);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Gagal export CSV");
    } finally {
      setExportingInv(false);
    }
  };

  const openHistory = (args: {
    productId: string;
    productName: string;
    locationName?: string;
    variantId: string;
    variantName: string;
    sku: string;
  }) =>
    setHistory({
      productId: args.productId,
      productName: args.productName,
      locationName: args.locationName ?? "",
      variant: { id: args.variantId, variant_name: args.variantName, sku: args.sku } as IProductVariantItem,
    });

  const stockHeaders = [
    {
      id: "product_name",
      text: "Product Name",
      value: (row: IStockReportRow) => <span className="font-medium text-foreground">{row.product_name || "-"}</span>,
    },
    {
      id: "variant_name",
      text: "Variant Name",
      value: (row: IStockReportRow) => (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{row.variant_name}</p>
          <span className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{row.sku || "-"}</span>
        </div>
      ),
    },
    {
      id: "category",
      text: "Category",
      value: (row: IStockReportRow) =>
        row.category ? (
          <Badge variant="outline" className="whitespace-nowrap">
            <Tag />
            {row.category}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "location",
      text: "Location",
      value: (row: IStockReportRow) =>
        row.location ? (
          <Badge variant="outline" className="whitespace-nowrap border-blue-200 bg-blue-50 text-blue-700">
            <MapPin />
            {row.location}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "price_idr",
      text: "Price (IDR)",
      value: (row: IStockReportRow) => <span className="font-semibold whitespace-nowrap">Rp {idr.format(row.price_idr)}</span>,
    },
    {
      id: "stock_total",
      text: "Total",
      value: (row: IStockReportRow) => <span className="font-medium tabular-nums">{row.stock_total}</span>,
    },
    {
      id: "stock_rented",
      text: "Rented",
      value: (row: IStockReportRow) => <span className="tabular-nums text-indigo-500">{row.stock_rented}</span>,
    },
    {
      id: "stock_available",
      text: "Available",
      value: (row: IStockReportRow) => (
        <Badge variant="outline" className={cn("whitespace-nowrap tabular-nums", stockTone(row.stock_available, row.stock_total))}>
          {row.stock_available} • {stockLabel(row.stock_available, row.stock_total)}
        </Badge>
      ),
    },
    {
      id: "status",
      text: "Status",
      value: (row: IStockReportRow) => (
        <Badge variant="outline" className={cn("capitalize", row.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600")}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "is_rentable",
      text: "Type",
      value: (row: IStockReportRow) => (
        <Badge variant="outline" className={cn(row.is_rentable ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-emerald-200 bg-emerald-50 text-emerald-600")}>
          {row.is_rentable ? "Rent" : "Sell"}
        </Badge>
      ),
    },
  ];

  const stockActions = {
    text: "History",
    show: true,
    render: (row: IStockReportRow) => (
      <Button
        variant="ghost"
        size="icon"
        title="Stock history"
        onClick={() =>
          openHistory({
            productId: row.product_id,
            productName: row.product_name,
            locationName: row.location,
            variantId: row.variant_id,
            variantName: row.variant_name,
            sku: row.sku,
          })
        }
      >
        <History />
      </Button>
    ),
  };

  const invHeaders = [
    {
      id: "location",
      text: "Location",
      value: (row: IInventorySnapshotItem) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium whitespace-nowrap text-foreground">{row.location?.name ?? "-"}</span>
          <span className="w-fit rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700">{row.location?.code ?? "-"}</span>
        </div>
      ),
    },
    {
      id: "product",
      text: "Product Name",
      value: (row: IInventorySnapshotItem) => <span className="font-medium text-foreground">{row.variant.product?.name ?? "-"}</span>,
    },
    {
      id: "category",
      text: "Category",
      value: (row: IInventorySnapshotItem) => {
        const name = categoryNameOf(row.variant.product?.id);
        return name ? (
          <Badge variant="outline" className="whitespace-nowrap">
            <Tag />
            {name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "variant",
      text: "Variant Name",
      value: (row: IInventorySnapshotItem) => (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{row.variant.variant_name}</p>
          <span className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{row.variant.sku}</span>
        </div>
      ),
    },
    {
      id: "price_idr",
      text: "Price (IDR)",
      value: (row: IInventorySnapshotItem) => <span className="font-semibold whitespace-nowrap">Rp {idr.format(row.variant.price_idr ?? 0)}</span>,
    },
    {
      id: "stock_total",
      text: "Total",
      value: (row: IInventorySnapshotItem) => <span className="font-medium tabular-nums">{row.stock_total ?? 0}</span>,
    },
    {
      id: "stock_rented",
      text: "Rented",
      value: (row: IInventorySnapshotItem) => <span className="tabular-nums text-indigo-500">{row.stock_rented ?? 0}</span>,
    },
    {
      id: "stock_available",
      text: "Available",
      value: (row: IInventorySnapshotItem) => (
        <Badge variant="outline" className={cn("whitespace-nowrap tabular-nums", stockTone(row.stock_available, row.stock_total))}>
          {row.stock_available ?? 0} • {stockLabel(row.stock_available, row.stock_total)}
        </Badge>
      ),
    },
  ];

  const invActions = {
    text: "History",
    show: true,
    render: (row: IInventorySnapshotItem) =>
      row.variant.product?.id ? (
        <Button
          variant="ghost"
          size="icon"
          title="Stock history"
          onClick={() =>
            openHistory({
              productId: row.variant.product.id,
              productName: row.variant.product?.name ?? "",
              locationName: row.location?.name ?? "",
              variantId: row.product_variant_id,
              variantName: row.variant.variant_name,
              sku: row.variant.sku,
            })
          }
        >
          <History />
        </Button>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
  };

  const onSelect = (setter: (v: string) => void, reset: () => void) => (s: SingleValue<SelectOption>) => {
    setter(s?.value ?? "");
    reset();
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <BackButtonComponent page="/admin/report">
          <span className="text-sm font-medium text-gray-500">Back to Reports</span>
        </BackButtonComponent>
        {tab === "stock" ? (
          <Button variant="outline" className="shrink-0 text-sm font-medium" disabled={exportingStock} onClick={handleExportStock}>
            {exportingStock ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </Button>
        ) : (
          <Button variant="outline" className="shrink-0 text-sm font-medium" disabled={exportingInv} onClick={handleExportInv}>
            {exportingInv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </Button>
        )}
      </div>

      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex w-full flex-row items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Stock Report</h3>
            <p className="text-sm font-normal text-gray-500">Preview matches the exported CSV (FE-only, no BE changes).</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GeneralTabComponent selecetedTab={tab} setTab={setTab} tabs={tabOptions} />

          {tab === "stock" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Package, label: "Variants", value: summary.variants, tone: "text-brand-500" },
                  { icon: Boxes, label: "Units total", value: summary.units, tone: "text-blue-500" },
                  { icon: CircleCheck, label: "Available", value: summary.available, tone: "text-green-500" },
                  { icon: TriangleAlert, label: "Low / empty", value: summary.low, tone: "text-amber-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-25 px-4 py-3">
                    <s.icon className={cn("size-5 shrink-0", s.tone)} />
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold tabular-nums">{stockQuery.isLoading ? "…" : idr.format(s.value)}</span>
                      <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3">
                <div className="w-[220px]">
                  <SearchInput
                    className="border-brand-100"
                    placeholder="Search variant / SKU / product..."
                    search={q}
                    onSearch={(v) => {
                      setQ(v);
                      resetStockPage();
                    }}
                  />
                </div>
                <div className="w-[200px]">
                  <Select
                    options={categoryOption}
                    isClearable
                    placeholder="Category"
                    className={selectClass}
                    onChange={onSelect(setCategoryId, resetStockPage)}
                  />
                </div>
                <div className="w-[160px]">
                  <Select
                    options={[
                      { value: "all", label: "Sell + Rent" },
                      { value: "false", label: "Sell" },
                      { value: "true", label: "Rent" },
                    ]}
                    placeholder="Sell / Rent"
                    className={selectClass}
                    onChange={onSelect((v) => setRentable(v === "" ? "all" : (v as "all" | "true" | "false")), resetStockPage)}
                  />
                </div>
                <div className="w-[220px]">
                  <Select
                    options={locationOption}
                    isClearable
                    placeholder="Location"
                    className={selectClass}
                    onChange={onSelect(setLocationCode, resetStockPage)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Switch
                    checked={includeInactive}
                    onCheckedChange={(v) => {
                      setIncludeInactive(v);
                      resetStockPage();
                    }}
                  />
                  <span>Show inactive</span>
                </div>
              </div>

              <CustomTable
                data={stockPageRows}
                headers={stockHeaders}
                isLoading={stockQuery.isLoading}
                actionOptions={stockActions}
                numberOptions={{ text: "No", show: true, render: (_: unknown, idx: number) => buildNumber(idx, stockLimit, stockPage) }}
              />
              {!stockQuery.isLoading && stockRows.length === 0 && (
                <p className="text-sm text-gray-500">No data for current filters — export still downloads a header-only CSV.</p>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-row flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3">
                <div className="w-[240px]">
                  <SearchInput
                    className="border-brand-100"
                    placeholder="Search SKU / name..."
                    search={invQ}
                    onSearch={(v) => {
                      setInvQ(v);
                      setInvPage(1);
                    }}
                  />
                </div>
                <div className="w-[240px]">
                  <Select
                    options={invLocationOption}
                    isClearable
                    placeholder="Filter by location"
                    className={selectClass}
                    onChange={onSelect(setInvLocationId, () => setInvPage(1))}
                  />
                </div>
              </div>

              <CustomTable
                data={invQuery.data?.data ?? []}
                headers={invHeaders}
                isLoading={invQuery.isLoading}
                actionOptions={invActions}
                numberOptions={{ text: "No", show: true, render: (_: unknown, idx: number) => buildNumber(idx, invLimit, invPage) }}
              />
              {!invQuery.isLoading && (invQuery.data?.data ?? []).length === 0 && (
                <p className="text-sm text-gray-500">No data for current filters — export still downloads a header-only CSV.</p>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex w-full">
          {tab === "stock" ? (
            <CustomPagination
              onPageChange={setStockPage}
              currentPage={stockPage}
              showTotal
              hasPrevPage={stockPage > 1}
              hasNextPage={stockPage * stockLimit < stockRows.length}
              totalItems={stockRows.length}
              totalPages={Math.max(1, Math.ceil(stockRows.length / stockLimit))}
              limit={stockLimit}
            />
          ) : (
            <CustomPagination
              onPageChange={setInvPage}
              currentPage={invPage}
              showTotal
              hasPrevPage={invQuery.data?.pagination?.has_prev}
              hasNextPage={invQuery.data?.pagination?.has_next}
              totalItems={invQuery.data?.pagination?.total_items as number}
              totalPages={invQuery.data?.pagination?.total_pages as number}
              limit={invLimit}
            />
          )}
        </CardFooter>
      </Card>

      <Dialog open={!!history} onOpenChange={(open) => !open && setHistory(null)}>
        <DialogContent className="max-h-[90vh] w-fit max-w-[95vw] overflow-auto sm:max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Stock History — {history?.variant.variant_name ?? ""}</DialogTitle>
            {history && (
              <DialogDescription>
                {history.productName} • SKU {history.variant.sku || "-"}
                {history.locationName ? ` • ${history.locationName}` : ""}
              </DialogDescription>
            )}
          </DialogHeader>
          {history && (
            <ProductMovementsTab
              key={history.variant.id}
              productId={history.productId}
              variants={[history.variant]}
              initialVariantId={history.variant.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
