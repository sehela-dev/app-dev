import { getCashFlowReport } from "@/api-req/report";

import { IParamsCashFlowReport } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetClassFlowReport = (params: IParamsCashFlowReport) =>
  useQuery({
    queryKey: ["dashboard", "report", "outstanding-credit", "cash-flow", params],
    queryFn: () => getCashFlowReport(params),
    refetchOnWindowFocus: false,
    enabled: false,
  });
