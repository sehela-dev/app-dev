import { getCreditsLedgerSummary } from "@/api-req/report";
import { ICreditsLedgerParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetCreditsLedgerSummary = (
  params: Omit<ICreditsLedgerParams, "page" | "page_size" | "order" | "format">,
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "credits", "ledger", "summary", params],
    queryFn: () => getCreditsLedgerSummary(params),
    refetchOnWindowFocus: false,
    enabled,
  });
