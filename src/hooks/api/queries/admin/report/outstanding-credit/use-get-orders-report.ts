import { getOrdersReportPreview } from "@/api-req/report";

import { IOrdersReportParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetOrdersReport = (params: IOrdersReportParams) =>
  useQuery({
    queryKey: ["dashboard", "report", "orders", params],
    queryFn: () => getOrdersReportPreview(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
