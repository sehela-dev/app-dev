import { generateTableOutstandingCredit } from "@/api-req/report";
import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetOutstandingCreditTable = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "report", "outstanding-credit", params],
    queryFn: () => generateTableOutstandingCredit(params),
    refetchOnWindowFocus: false,
    enabled: false,
  });
