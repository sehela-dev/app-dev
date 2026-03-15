import { getClassCategoryDetail } from "@/api-req/class-session";

import { useQuery } from "@tanstack/react-query";

export const useGetDetailClassSessionsCategory = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "class", "category", "seesion", "class-categorry", params],
    queryFn: () => getClassCategoryDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
