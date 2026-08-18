import { getPublicSession } from "@/api-req/customer-app";
import { IPublicSession } from "@/types/customer-app/public.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicSession = (id?: string) =>
  useQuery<IPublicSession>({
    queryKey: ["customer", "public", "session", id],
    queryFn: () => getPublicSession(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });