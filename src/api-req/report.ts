import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  ICreditsLedgerParams,
  IOutstandingDetailParams,
  IRecognitionRunResult,
  TCashFlowReport,
  TCreditsLedger,
  TCreditsLedgerSummary,
  TGenerateReportOutstandingCredit,
  TOutstandingCreditTable,
  TOutstandingDetail,
  TOutstandingReports,
  TOutstandingSummary,
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
