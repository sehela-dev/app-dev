import { getPublicCreditPackages } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetPublicCreditPackagesInfinite = (params: Omit<ICommonParams, "page" | "limit"> = {}, pageSize = 10) =>
  useInfiniteQuery({
    queryKey: ["customer", "public", "credit-packages", "infinite", params, pageSize],
    queryFn: ({ pageParam = 1 }) => getPublicCreditPackages({ ...params, page: pageParam as number, limit: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.pagination?.has_next ? lastPage.pagination.page + 1 : undefined),
    refetchOnWindowFocus: false,
  });
