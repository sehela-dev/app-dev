import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  ICreditsLedgerParams,
  ICustomerLoyaltyParams,
  ICustomerLoyaltyResponse,
  ICustomerLoyaltyRow,
  IOrdersReportParams,
  IOutstandingDetailParams,
  IRecognitionRunResult,
  IRefundReportParams,
  ISalesSummaryParams,
  ISalesSummaryResponse,
  TCashFlowReport,
  TCreditsLedger,
  TCreditsLedgerSummary,
  TGenerateReportOutstandingCredit,
  TOrdersReportPreview,
  TOutstandingCreditTable,
  TOutstandingDetail,
  TOutstandingReports,
  TOutstandingSummary,
  TRefundReportPreview,
} from "@/types/report.interface";

export const generateTableOutstandingCredit: TOutstandingCreditTable = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/packages/by-purchase-period`, {
    params: {
      start_date: params.startDate,
      end_date: params.endDate,
    },
  });
  return res.data;
};

export const generateOutstandingReport: TGenerateReportOutstandingCredit = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/credits/outstanding/generate`, {
    year: Number(data.year),
    month: Number(data.month),
    ...(data.allow_incomplete ? { allow_incomplete: true } : {}),
    ...(data.force_regenerate ? { force_regenerate: true } : {}),
  });
  return res.data;
};

// Outstanding snapshot — as_of (YYYY-MM-DD) or year/month, format json|csv
export const getOutstandingDetail: TOutstandingDetail = async (params) => {
  const isCsv = params.format === "csv";
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/outstanding/detail`, {
    params: {
      ...(params.asOf ? { as_of: params.asOf } : {}),
      ...(params.year ? { year: params.year } : {}),
      ...(params.month ? { month: params.month } : {}),
      ...(params.format ? { format: params.format } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.page_size ? { page_size: params.page_size } : {}),
    },
    ...(isCsv ? { responseType: "blob" as const } : {}),
  });
  if (isCsv) return res.data as unknown as never;
  const d = res.data as { success?: boolean; data: unknown; statusCode?: number; message?: string; pagination?: unknown };
  if (d.success !== undefined) {
    return { statusCode: d.statusCode ?? 200, message: d.message ?? "ok", data: d.data as never, pagination: d.pagination as never } as never;
  }
  return res.data;
};

export const exportOutstandingDetailCsv = async (params: Omit<IOutstandingDetailParams, "format">): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/outstanding/detail`, {
    params: { ...(params.asOf ? { as_of: params.asOf } : {}), ...(params.year ? { year: params.year } : {}), ...(params.month ? { month: params.month } : {}), format: "csv" },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

export const getOutstandingSummary: TOutstandingSummary = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/outstanding/summary`, {
    params: {
      ...(params.asOf ? { as_of: params.asOf } : {}),
      ...(params.year ? { year: params.year } : {}),
      ...(params.month ? { month: params.month } : {}),
    },
  });
  const d = res.data as { success?: boolean; data: unknown; statusCode?: number; message?: string };
  if (d.success !== undefined) {
    return { statusCode: d.statusCode ?? 200, message: d.message ?? "ok", data: d.data as never } as never;
  }
  return res.data;
};

export const listOutstandingReports: TOutstandingReports = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/outstanding/reports`, { params });
  const d = res.data as { success?: boolean; data: unknown; statusCode?: number; message?: string; pagination?: unknown };
  if (d.success !== undefined) {
    return { statusCode: d.statusCode ?? 200, message: d.message ?? "ok", data: d.data as never, pagination: d.pagination as never } as never;
  }
  return res.data;
};

export const getCashFlowReport: TCashFlowReport = async (data) => {
  const { branch, date, page, limit } = data;
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/reports/cash-movement`, {
    params: {
      ...(date ? { date } : null),
      ...(branch === "all" ? null : { branch }),
      page,
      page_size: limit,
    },
  });
  return res.data;
};

export const getCreditsLedger: TCreditsLedger = async (params) => {
  const isCsv = params.format === "csv";
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/ledger`, {
    params,
    ...(isCsv ? { responseType: "blob" as const } : null),
  });
  if (isCsv) return res.data as unknown as never;
  // normalize { success, data, pagination, meta } -> IResponseData + meta
  const d = res.data as {
    success?: boolean;
    data: unknown;
    pagination?: unknown;
    meta?: unknown;
    statusCode?: number;
    message?: string;
  };
  if (d.success !== undefined) {
    return {
      statusCode: d.statusCode ?? 200,
      message: d.message ?? "ok",
      data: d.data as never,
      pagination: d.pagination as never,
      meta: d.meta as never,
    } as never;
  }
  return res.data;
};

export const exportCreditsLedger = async (params: ICreditsLedgerParams): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/ledger`, {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

export const getCreditsLedgerSummary: TCreditsLedgerSummary = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/credits/ledger/summary`, { params });
  const d = res.data as { success?: boolean; data: unknown; statusCode?: number; message?: string };
  if (d.success !== undefined) {
    return { statusCode: d.statusCode ?? 200, message: d.message ?? "ok", data: d.data as never } as never;
  }
  return res.data;
};

export const runRecognition = async (job_date?: string): Promise<IRecognitionRunResult> => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/credits/ledger/recognition-run`, job_date ? { job_date } : {});
  const d = res.data as { success?: boolean; data?: IRecognitionRunResult };
  return (d.data ?? res.data) as IRecognitionRunResult;
};

// Orders monthly report — preview table (JSON) + full-month CSV export.
// NOTE: GET /admin/orders without month/type/branch is the legacy list (different shape) — don't use it here.
export const getOrdersReportPreview: TOrdersReportPreview = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/orders`, {
    params: {
      ...(params.start_date ? { start_date: params.start_date } : {}),
      ...(params.end_date ? { end_date: params.end_date } : {}),
      ...(params.month ? { month: params.month } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.branch && params.branch !== "all" ? { branch: params.branch } : {}),
      ...(params.payment_type && params.payment_type !== "all" ? { payment_type: params.payment_type } : {}),
      ...(params.transaction_type && params.transaction_type !== "all" ? { transaction_type: params.transaction_type } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.page_size ? { page_size: params.page_size } : {}),
    },
  });
  return res.data;
};

export const exportOrdersReportCsv = async (params: Omit<IOrdersReportParams, "page" | "page_size">): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/orders/export`, {
    params: {
      ...(params.start_date ? { start_date: params.start_date } : {}),
      ...(params.end_date ? { end_date: params.end_date } : {}),
      ...(params.month ? { month: params.month } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.branch && params.branch !== "all" ? { branch: params.branch } : {}),
      ...(params.payment_type && params.payment_type !== "all" ? { payment_type: params.payment_type } : {}),
      ...(params.transaction_type && params.transaction_type !== "all" ? { transaction_type: params.transaction_type } : {}),
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

// Refund/void report — preview table (JSON) + full-window CSV export.
// NOTE: GET /admin/refunds is the frozen ops list (different shape, no transactionBy/CSV) — don't use it here.
export const getRefundReportPreview: TRefundReportPreview = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/refund-report`, {
    params: {
      month: params.month,
      ...(params.status && params.status !== "all" ? { status: params.status } : {}),
      ...(params.type && params.type !== "all" ? { type: params.type } : {}),
      ...(params.payment_method ? { payment_method: params.payment_method } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.page_size ? { page_size: params.page_size } : {}),
    },
  });
  return res.data;
};

export const exportRefundReportCsv = async (params: Omit<IRefundReportParams, "page" | "page_size">): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/refund-report`, {
    params: {
      month: params.month,
      ...(params.status && params.status !== "all" ? { status: params.status } : {}),
      ...(params.type && params.type !== "all" ? { type: params.type } : {}),
      ...(params.payment_method ? { payment_method: params.payment_method } : {}),
      ...(params.search ? { search: params.search } : {}),
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

// Sales summary — daily collected-sales for one WIB month (JSON preview + CSV download).
// NOTE: GET /admin/sales-summary?format=csv returns a blob, not ISalesSummaryResponse.
export const getSalesSummary = async (params: ISalesSummaryParams): Promise<ISalesSummaryResponse> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/sales-summary`, {
    params: {
      ...(params.month ? { month: params.month } : {}),
      ...(params.branch && params.branch !== "all" ? { branch: params.branch } : {}),
    },
  });
  return res.data;
};

export const exportSalesSummaryCsv = async (params: ISalesSummaryParams): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/sales-summary`, {
    params: {
      ...(params.month ? { month: params.month } : {}),
      ...(params.branch && params.branch !== "all" ? { branch: params.branch } : {}),
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

// Customer loyalty — per-student summary (proposed GET /admin/customer-loyalty, not built yet).
// View + CSV builder below already speak the contract, so wiring the endpoint later needs no UI change.
export const getCustomerLoyalty = async (params: ICustomerLoyaltyParams): Promise<ICustomerLoyaltyResponse> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/customer-loyalty`, {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.page_size ? { page_size: params.page_size } : {}),
      ...(params.sort_by ? { sort_by: params.sort_by } : {}),
      ...(params.order ? { order: params.order } : {}),
    },
  });
  return res.data;
};

export const exportCustomerLoyaltyCsv = async (params: Omit<ICustomerLoyaltyParams, "page" | "page_size">): Promise<Blob> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/customer-loyalty`, {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.sort_by ? { sort_by: params.sort_by } : {}),
      ...(params.order ? { order: params.order } : {}),
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

// Client-side CSV fallback until the endpoint ships format=csv.
// Same columns/order as .scratch/customer_loyalty_2026-09-19.csv: raw values, every field double-quoted, UTF-8.
const CUSTOMER_LOYALTY_CSV_HEADER = "nama_customer,kontak,sesi_terakhir,jumlah_kehadiran,penjualan_terakhir_tgl,penjualan_terakhir_idr,total_penjualan";

const csvCell = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const buildCustomerLoyaltyCsv = (rows: ICustomerLoyaltyRow[]): string =>
  [
    CUSTOMER_LOYALTY_CSV_HEADER,
    ...rows.map((r) =>
      [
        csvCell(r.nama_customer),
        csvCell(r.kontak),
        csvCell(r.sesi_terakhir),
        csvCell(r.jumlah_kehadiran ?? 0),
        csvCell(r.penjualan_terakhir_tgl),
        csvCell(r.penjualan_terakhir_idr ?? 0),
        csvCell(r.total_penjualan ?? 0),
      ].join(","),
    ),
  ].join("\r\n");
