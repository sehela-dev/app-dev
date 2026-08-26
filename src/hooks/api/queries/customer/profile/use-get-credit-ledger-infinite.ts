import { getCreditLedger } from "@/api-req/customer-app/credits";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetCreditLedgerInfinite = (pageSize = 20) =>
  useInfiniteQuery({
    queryKey: ["user", "profile", "credit-ledger", "infinite", pageSize],
    queryFn: ({ pageParam = 1 }) => getCreditLedger({ page: pageParam as number, page_size: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.pagination?.has_next ? lastPage.pagination.page + 1 : undefined),
    refetchOnWindowFocus: false,
  });
