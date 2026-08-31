import { getPublicSessions } from "@/api-req/customer-app";
import { IPublicSessionsParams } from "@/types/customer-app/public.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicSessions = (params: IPublicSessionsParams) =>
  useQuery({
    queryKey: ["customer", "public", "sessions", params],
    queryFn: () => getPublicSessions(params),
    refetchOnWindowFocus: false,
  });