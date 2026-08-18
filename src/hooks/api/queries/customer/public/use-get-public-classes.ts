import { getPublicClasses } from "@/api-req/customer-app";
import { IPublicClassesParams } from "@/types/customer-app/public.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicClasses = (params: IPublicClassesParams = {}) =>
  useQuery({
    queryKey: ["customer", "public", "classes", params],
    queryFn: () => getPublicClasses(params),
    refetchOnWindowFocus: false,
  });