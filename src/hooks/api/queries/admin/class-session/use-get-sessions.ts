import { getSessions } from "@/api-req/class-session";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetSessions = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "orders", "new-order", "sessions", params],
    queryFn: () => getSessions(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
