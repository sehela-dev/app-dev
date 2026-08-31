import { getPublicSessions } from "@/api-req/customer-app";
import { IPublicSessionsParams, IPublicSessionsResponse } from "@/types/customer-app/public.interface";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetPublicSessionsInfinite = (params: IPublicSessionsParams, pageSize = 50) =>
  useInfiniteQuery<IPublicSessionsResponse>({
    queryKey: ["customer", "public", "sessions", "infinite", params, pageSize],
    queryFn: ({ pageParam = 1 }) => getPublicSessions({ ...params, page: pageParam as number, page_size: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined),
    refetchOnWindowFocus: false,
  });
