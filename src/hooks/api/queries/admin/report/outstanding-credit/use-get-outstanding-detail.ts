import { getOutstandingDetail } from "@/api-req/report";
import { IOutstandingDetailParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetOutstandingDetail = (params: IOutstandingDetailParams, enabled = true) => {
  const hasAsOf = !!params.asOf;
  const hasYm = !!(params.year && params.month);
  return useQuery({
    queryKey: ["outstanding", "detail", params],
    queryFn: () => getOutstandingDetail(params),
    enabled: enabled && (hasAsOf || hasYm),
    refetchOnWindowFocus: false,
  });
};
