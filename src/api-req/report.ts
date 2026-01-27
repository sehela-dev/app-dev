import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TGenerateReportOutstandingCredit, TOutstandingCreditTable } from "@/types/report.interface";

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
