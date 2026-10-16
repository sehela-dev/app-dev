import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IInventoryParams,
  IInventorySnapshotItem,
  IProductItemList,
  IProductListParams,
  IProductMovement,
  IProductMovementsParams,
  IProductVariantItem,
  TAddNewVariants,
  TCreateProduct,
  TDeleteProduct,
  TDeleteVariant,
  TInventoryAdjustment,
  TInventoryList,
  TInventoryLocations,
  TInventoryTransfer,
  TProductCategories,
  TProductDetail,
  TProductItemList,
  TProductMovements,
  TUpdateProduct,
  TUpdateSingleVariant,
  TUpdateVariant,
} from "@/types/product.interface";

export const getProductList: TProductItemList = async ({ page, limit, search, view, is_rentable, category_id, include_inactive, product_id }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      ...(view ? { view } : null),
      ...(is_rentable !== undefined && is_rentable !== "" ? { is_rentable } : null),
      ...(category_id ? { category_id } : null),
      ...(include_inactive ? { include_inactive: true } : null),
      ...(product_id ? { product_id } : null),
    },
  });
  return res.data;
};

export const createProduct: TCreateProduct = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/products`, data);
  return res.data;
};

// prroduct detail

export const getProductDetail: TProductDetail = async (data) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products/${data}`);
  return res.data;
};

// product movement history
export const getProductMovements: TProductMovements = async (id, params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products/${id}/movements`, {
    params: {
      ...(params?.page ? { page: params.page } : null),
      ...(params?.limit ? { page_size: params.limit } : null),
      ...(params?.variant_id ? { variant_id: params.variant_id } : null),
      ...(params?.location_id ? { location_id: params.location_id } : null),
      ...(params?.reference_type ? { reference_type: params.reference_type } : null),
      ...(params?.start_date ? { start_date: params.start_date } : null),
      ...(params?.end_date ? { end_date: params.end_date } : null),
    },
  });
  return res.data;
};

// product category
export const getProductCategoryList: TProductCategories = async ({ page, limit }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/categories`, {
    params: {
      page,
      page_size: limit,
    },
  });
  return res.data;
};

//branch
export const getInventoryLocations: TInventoryLocations = async (data) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/inventory-locations`, {
    params: {
      ...(data?.category_id ? { category_id: data?.category_id } : null),
      ...(data?.product_id ? { product_id: data?.product_id } : null),
    },
  });
  return res.data;
};

// inventory snapshot
export const getInventoryList: TInventoryList = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/inventory`, {
    params: {
      ...(params?.page ? { page: params.page } : null),
      ...(params?.limit ? { page_size: params.limit } : null),
      ...(params?.location_id ? { location_id: params.location_id } : null),
      ...(params?.variant_id ? { variant_id: params.variant_id } : null),
      ...(params?.product_id ? { product_id: params.product_id } : null),
      ...((params as { q?: string })?.q ? { q: (params as { q?: string }).q } : null),
    },
  });
  return res.data;
};

// add variants
export const addNewVariants: TAddNewVariants = async ({ data, id }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/products/${id}/variants`, data);
  return res.data;
};

// update single variant
export const updateSingleVariant: TUpdateSingleVariant = async ({ id, idVar, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/products/${id}/variants/${idVar}`, data);
  return res.data;
};

// update product detail (name, category, description, photos)
export const updateProduct: TUpdateProduct = async ({ id, payload }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/products/${id}`, payload);
  return res.data;
};

// update variant detail (sku, name, price, and branch assignment for manager)
export const updateVariantDetail: TUpdateVariant = async ({ id, idVar, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/products/${id}/variants/${idVar}`, data);
  return res.data;
};

// inventory adjustment (stock-in / stock-out with reason)
export const adjustProductVariantInventory: TInventoryAdjustment = async ({ variantId, payload, idempotencyKey }) => {
  // ponytail: send both note+reason and delta aliases, BE accepts either per handoff
  const note = payload.note ?? payload.reason ?? "";
  const res = await axiosx(true).post(
    `${MAIN_API_URL}/admin/product-variants/${variantId}/inventory-adjustments`,
    {
      location_id: payload.location_id,
      quantity_delta: payload.quantity_delta,
      delta: payload.quantity_delta,
      note,
      reason: note,
    },
    {
      headers: { "Idempotency-Key": idempotencyKey },
    },
  );
  return res.data;
};

// inventory transfer between locations
export const transferProductVariantInventory: TInventoryTransfer = async ({ payload, idempotencyKey }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/inventory/transfers`, payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return res.data;
};

// soft delete product + all variants
export const deleteProduct: TDeleteProduct = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/products/${id}`);
  return res.data;
};

// delete single variant (min 1 active must remain — enforced server-side)
export const deleteProductVariant: TDeleteVariant = async ({ id, idVar }) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/products/${id}/variants/${idVar}`);
  return res.data;
};

// ------------------------------------------------------------------
// CSV export — FE-only (tanpa endpoint BE baru).
// Status BE 2026-10-13: /admin/products, /admin/inventory, dan
// /admin/products/:id/movements belum dukung `?format=csv` (param
// diabaikan BE) — jadi JANGAN kirim format=csv, langsung fetch semua
// halaman JSON lalu rakit CSV lokal. Pola return Blob sama seperti
// report.ts: view tinggal panggil downloadCsvBlob().
// ------------------------------------------------------------------

const csvCell = (v: string | number | boolean | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const toCsvBlob = (csv: string): Blob => new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

async function fetchAllPages<T>(fetchPage: (page: number) => Promise<{ data: T[]; pagination?: { total_pages: number } }>): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  for (let i = 0; i < 100; i++) {
    const res = await fetchPage(page);
    out.push(...(res.data ?? []));
    const total = res.pagination?.total_pages ?? 1;
    if (page >= total) break;
    page += 1;
  }
  return out;
}

// --- 1. Master product ---
export const buildProductMasterCsv = (rows: IProductItemList[]): string => {
  const header = "id,nama,kategori,is_rentable,is_active,jumlah_variant,stock_total,stock_available,created_at";
  const lines = rows.map((r) =>
    [
      csvCell(r.id),
      csvCell(r.name),
      csvCell(r.category?.name ?? ""),
      csvCell(r.is_rentable),
      csvCell(r.is_active),
      csvCell(r.variant_count ?? 0),
      csvCell(r.stock_total ?? r.stock ?? 0),
      csvCell(r.stock_available ?? 0),
      csvCell(r.created_at ?? ""),
    ].join(","),
  );
  return [header, ...lines].join("\r\n");
};

export const exportProductMasterCsv = async (params: Omit<IProductListParams, "page" | "limit"> & { view?: "full" | "variants" }): Promise<Blob> => {
  const { search, view, is_rentable, category_id, include_inactive, product_id } = params;
  const rows = await fetchAllPages<IProductItemList>((page) =>
    getProductList({ page, limit: 100, search, view, is_rentable, category_id, include_inactive, product_id }).then((r) => ({
      data: (r.data ?? []) as IProductItemList[],
      pagination: r.pagination,
    })),
  );
  return toCsvBlob(buildProductMasterCsv(rows));
};

// --- 2. Stock opname (snapshot inventory per lokasi) ---
export const buildInventorySnapshotCsv = (rows: IInventorySnapshotItem[]): string => {
  const header = "product_name,variant_name,sku,location_code,location_name,stock_total,stock_rented,stock_available,updated_at";
  const lines = rows.map((r) =>
    [
      csvCell(r.variant?.product?.name ?? ""),
      csvCell(r.variant?.variant_name ?? ""),
      csvCell(r.variant?.sku ?? ""),
      csvCell(r.location?.code ?? ""),
      csvCell(r.location?.name ?? ""),
      csvCell(r.stock_total ?? 0),
      csvCell(r.stock_rented ?? 0),
      csvCell(r.stock_available ?? 0),
      csvCell(r.updated_at ?? ""),
    ].join(","),
  );
  return [header, ...lines].join("\r\n");
};

export const exportInventorySnapshotCsv = async (params: Omit<IInventoryParams, "page" | "limit"> = {}): Promise<Blob> => {
  const rows = await fetchAllPages<IInventorySnapshotItem>((page) =>
    getInventoryList({ ...params, page, limit: 100 }).then((r) => ({ data: r.data ?? [], pagination: r.pagination })),
  );
  return toCsvBlob(buildInventorySnapshotCsv(rows));
};

// --- 3. Kartu stok / mutasi (product movements) ---
export const buildProductMovementsCsv = (rows: IProductMovement[]): string => {
  const header = "created_at,product_name,variant_name,sku,location,movement_type,qty_total,qty_rented,reference_type,note,actor";
  const lines = rows.map((r) =>
    [
      csvCell(r.created_at ?? ""),
      csvCell(r.variant?.product?.name ?? ""),
      csvCell(r.variant?.variant_name ?? ""),
      csvCell(r.variant?.sku ?? ""),
      csvCell(r.location?.name ?? ""),
      csvCell(r.movement_type ?? ""),
      csvCell(r.quantity_delta_total ?? 0),
      csvCell(r.quantity_delta_rented ?? 0),
      csvCell(r.reference_type ?? ""),
      csvCell(r.note ?? ""),
      csvCell(r.actor?.full_name ?? ""),
    ].join(","),
  );
  return [header, ...lines].join("\r\n");
};

export const exportProductMovementsCsv = async (productId: string, params: Omit<IProductMovementsParams, "page" | "limit"> = {}): Promise<Blob> => {
  const rows = await fetchAllPages<IProductMovement>((page) =>
    getProductMovements(productId, { ...params, page, limit: 100 }).then((r) => ({ data: r.data ?? [], pagination: r.pagination })),
  );
  return toCsvBlob(buildProductMovementsCsv(rows));
};

// --- 4. Penjualan product (pakai /admin/orders/export, sudah ada di BE) ---
export const exportProductSalesCsv = async (params: {
  start_date?: string;
  end_date?: string;
  month?: string;
  branch?: string;
  payment_type?: string;
}): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/orders/export`, {
    params: {
      ...(params.start_date ? { start_date: params.start_date } : {}),
      ...(params.end_date ? { end_date: params.end_date } : {}),
      ...(params.month ? { month: params.month } : {}),
      type: "money",
      transaction_type: "product",
      ...(params.branch && params.branch !== "all" ? { branch: params.branch } : {}),
      ...(params.payment_type && params.payment_type !== "all" ? { payment_type: params.payment_type } : {}),
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

// Trigger download generik — satu baris di view.
export const downloadCsvBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ------------------------------------------------------------------
// Stock report — flat variants, FE-only (preview == CSV).
// Status BE 2026-10-13: belum ada endpoint report khusus preview JSON +
// export CSV untuk product/inventory, dan `view=variants` tidak dukung `q`
// (BE abaikan) — jadi search + filter lokasi jalan client-side.
// 1 baris = 1 {variant x lokasi}; variant tanpa inventory = 1 baris
// dengan Location kosong dan total level-variant.
// ------------------------------------------------------------------

export interface IStockReportRow {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  category: string;
  location: string;
  price_idr: number;
  stock_total: number;
  stock_rented: number;
  stock_available: number;
  status: "active" | "inactive";
  is_rentable: boolean;
}

export interface IStockReportParams {
  q?: string;
  category_id?: string;
  is_rentable?: boolean | string;
  include_inactive?: boolean;
  product_id?: string;
  location_code?: string;
}

const STOCK_REPORT_CSV_HEADER =
  "Product Name,Variant Name,SKU,Category,Location,Price (IDR),Stock Total,Stock Rented,Stock Available,Status,Is Rentable";

// Sumber benar: stock_total - stock_rented = stock_available (stock = alias legacy).
export const toStockReportRows = (variants: IProductVariantItem[], categoryByProductId: Map<string, string> = new Map()): IStockReportRow[] =>
  variants.flatMap((v) => {
    const cat = categoryByProductId.get(v.product_id) ?? "";
    return (v.inventory?.length ? v.inventory : [null]).map((inv) => {
      const total = inv?.stock_total ?? v.stock_total ?? 0;
      const rented = inv?.stock_rented ?? v.stock_rented ?? 0;
      return {
        product_id: v.product_id,
        variant_id: v.id,
        product_name: v.product_name ?? "",
        variant_name: v.variant_name ?? "",
        sku: v.sku ?? "",
        category: cat,
        location: inv?.location?.code ?? "",
        price_idr: v.price_idr ?? 0,
        stock_total: total,
        stock_rented: rented,
        stock_available: total - rented,
        status: (v.is_active ? "active" : "inactive") as "active" | "inactive",
        is_rentable: v.is_rentable ?? false,
      };
    });
  });

export const buildStockReportCsv = (rows: IStockReportRow[]): string => {
  const lines = rows.map((r) =>
    [
      csvCell(r.product_name),
      csvCell(r.variant_name),
      csvCell(r.sku),
      csvCell(r.category),
      csvCell(r.location),
      csvCell(r.price_idr),
      csvCell(r.stock_total),
      csvCell(r.stock_rented),
      csvCell(r.stock_available),
      csvCell(r.status),
      csvCell(r.is_rentable),
    ].join(","),
  );
  // Data kosong -> file hanya-header, jangan error.
  return [STOCK_REPORT_CSV_HEADER, ...lines].join("\r\n");
};

// Ambil semua halaman view=variants (page_size=100); q + location_code
// difilter client-side karena BE mengabaikannya. category_id dikirim ke
// BE sekaligus difilter ulang client-side via map master (idempotent).
export const getStockReportRows = async (params: IStockReportParams = {}): Promise<IStockReportRow[]> => {
  const { q, category_id, is_rentable, include_inactive, product_id, location_code } = params;
  const [variants, master] = await Promise.all([
    fetchAllPages<IProductVariantItem>((page) =>
      getProductList({
        page,
        limit: 100,
        view: "variants",
        ...(is_rentable !== undefined && is_rentable !== "" ? { is_rentable } : null),
        ...(category_id ? { category_id } : null),
        ...(include_inactive ? { include_inactive: true } : null),
        ...(product_id ? { product_id } : null),
      }).then((r) => ({ data: (r.data ?? []) as IProductVariantItem[], pagination: r.pagination })),
    ),
    // ponytail: 1 fetch ekstra untuk nama kategori (variant tak bawa category);
    // hapus saat BE sertakan category di view=variants.
    fetchAllPages<IProductItemList>((page) =>
      getProductList({
        page,
        limit: 100,
        view: "full",
        ...(is_rentable !== undefined && is_rentable !== "" ? { is_rentable } : null),
        ...(include_inactive ? { include_inactive: true } : null),
        ...(product_id ? { product_id } : null),
      }).then((r) => ({ data: (r.data ?? []) as IProductItemList[], pagination: r.pagination })),
    ),
  ]);
  const categoryByProductId = new Map(master.map((m) => [m.id, m.category?.name ?? ""] as const));
  const masterCategoryId = new Map(master.map((m) => [m.id, m.category_id] as const));
  const needle = q?.trim().toLowerCase() ?? "";
  const loc = location_code?.trim().toLowerCase() ?? "";
  const filtered = variants.filter((v) => {
    if (category_id && (masterCategoryId.get(v.product_id) ?? "") !== category_id) return false;
    if (needle && ![v.variant_name, v.sku, v.product_name].some((f) => (f ?? "").toLowerCase().includes(needle))) return false;
    if (loc && !(v.inventory ?? []).some((inv) => (inv.location?.code ?? "").toLowerCase() === loc)) return false;
    return true;
  });
  const rows = toStockReportRows(filtered, categoryByProductId);
  return loc ? rows.filter((r) => r.location.toLowerCase() === loc) : rows;
};

export const exportStockReportCsv = async (params: IStockReportParams = {}): Promise<Blob> =>
  toCsvBlob(buildStockReportCsv(await getStockReportRows(params)));

// Map product_id -> nama kategori untuk view yang datanya tak bawa category
// (tab Inventory per-lokasi).
// ponytail: 1 fetch view=full ekstra; hapus saat BE sertakan category di /admin/inventory.
export const getCategoryNameByProductId = async (): Promise<Map<string, string>> => {
  const master = await fetchAllPages<IProductItemList>((page) =>
    getProductList({ page, limit: 100, view: "full", include_inactive: true }).then((r) => ({
      data: (r.data ?? []) as IProductItemList[],
      pagination: r.pagination,
    })),
  );
  return new Map(master.map((m) => [m.id, m.category?.name ?? ""] as const));
};

// stock_report_2026-10-13[_kemang][_rentable|_sell][_inactive].csv
export const stockReportFilename = (params: Pick<IStockReportParams, "location_code" | "is_rentable" | "include_inactive"> = {}): string => {
  const date = new Date().toISOString().slice(0, 10);
  const segs = [
    params.location_code?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    params.is_rentable === true || params.is_rentable === "true" ? "rentable" : params.is_rentable === false || params.is_rentable === "false" ? "sell" : "",
    params.include_inactive ? "inactive" : "",
  ].filter(Boolean);
  return [`stock_report_${date}`, ...segs].join("_") + ".csv";
};
