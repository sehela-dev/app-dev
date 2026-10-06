import { getAllSessions, getSessions } from "@/api-req/class-session";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetSessions = (params: ICommonParams, enabled = true) =>
  useQuery({
    queryKey: ["dashboard", "orders", "new-order", "sessions", params],
    queryFn: () => getSessions(params),
    refetchOnWindowFocus: false,
    enabled: !!params && enabled,
  });

// Pages through the whole range (BE caps page_size) — for calendar views that must show everything.
export const useGetAllSessions = (params: ICommonParams, enabled = true) =>
  useQuery({
    queryKey: ["dashboard", "orders", "new-order", "sessions", "all", params],
    queryFn: () => getAllSessions(params),
    refetchOnWindowFocus: false,
    enabled: !!params && enabled,
    keepPreviousData: true,
  });
