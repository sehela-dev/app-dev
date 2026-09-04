import { getCreditsLedger } from "@/api-req/report";
import { ICreditsLedgerParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetCreditsLedger = (params: ICreditsLedgerParams) =>
  useQuery({
    queryKey: ["admin", "credits", "ledger", params],
    queryFn: () => getCreditsLedger(params),
    refetchOnWindowFocus: false,
  });
