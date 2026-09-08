import { listOutstandingReports } from "@/api-req/report";
import { IOutstandingReportsParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useListOutstandingReports = (params: IOutstandingReportsParams, enabled = true) =>
  useQuery({
    queryKey: ["outstanding", "reports", params],
    queryFn: () => listOutstandingReports(params),
    enabled,
    refetchOnWindowFocus: false,
  });
