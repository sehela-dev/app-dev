import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  ICreditsLedgerParams,
  TCashFlowReport,
  TCreditsLedger,
  TCreditsLedgerSummary,
  TGenerateReportOutstandingCredit,
  TOutstandingCreditTable,
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
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/credits/outstanding/generate`, data);
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
