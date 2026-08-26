import { getMyCredits } from "@/api-req/customer-app/credits";
import { IMyCreditParams } from "@/types/customer-app/my-credit.interface";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetMyCreditsInfinite = (params: Omit<IMyCreditParams, "page" | "page_size"> = {}, pageSize = 10) =>
  useInfiniteQuery({
    queryKey: ["user", "profile", "my-credits", "infinite", params, pageSize],
    queryFn: ({ pageParam = 1 }) => getMyCredits({ ...params, page: pageParam as number, page_size: pageSize }),
    getNextPageParam: (lastPage) => (lastPage.pagination?.has_next ? lastPage.pagination.page + 1 : undefined),
    refetchOnWindowFocus: false,
  });
