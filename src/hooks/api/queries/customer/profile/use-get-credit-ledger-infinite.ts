import { getCreditLedger } from "@/api-req/customer-app/credits";
import { ILedgerParams } from "@/types/customer-app/credit-ledger.interface";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetCreditLedgerInfinite = (params: Omit<ILedgerParams, "page" | "page_size"> = {}, pageSize = 20) =>
  useInfiniteQuery({
    queryKey: ["user", "profile", "credit-ledger", "infinite", params, pageSize],
    queryFn: ({ pageParam = 1 }) => getCreditLedger({ ...params, page: pageParam as number, page_size: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.pagination?.has_next ? lastPage.pagination.page + 1 : undefined),
    refetchOnWindowFocus: false,
  });
