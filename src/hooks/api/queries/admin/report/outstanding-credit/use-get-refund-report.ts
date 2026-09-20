import { getRefundReportPreview } from "@/api-req/report";

import { IRefundReportParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetRefundReport = (params: IRefundReportParams) =>
  useQuery({
    queryKey: ["dashboard", "report", "refund-report", params],
    queryFn: () => getRefundReportPreview(params),
    refetchOnWindowFocus: false,
    enabled: !!params.month,
  });
