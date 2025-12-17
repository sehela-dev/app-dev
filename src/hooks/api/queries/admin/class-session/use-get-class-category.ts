import { getClassCategory } from "@/api-req/class-session";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetClassSessionsCategory = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "class", "category", "seesion", "class-categorry", params],
    queryFn: () => getClassCategory(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
