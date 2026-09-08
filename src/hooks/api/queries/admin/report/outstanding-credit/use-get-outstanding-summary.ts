import { getOutstandingSummary } from "@/api-req/report";
import { IOutstandingDetailParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetOutstandingSummary = (params: Omit<IOutstandingDetailParams, "format" | "page" | "page_size">, enabled = true) => {
  const hasAsOf = !!params.asOf;
  const hasYm = !!(params.year && params.month);
  return useQuery({
    queryKey: ["outstanding", "summary", params],
    queryFn: () => getOutstandingSummary(params),
    enabled: enabled && (hasAsOf || hasYm),
    refetchOnWindowFocus: false,
  });
};
