import { getPublicInstructors } from "@/api-req/customer-app";
import { IPublicInstructorsParams } from "@/types/customer-app/public.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicInstructors = (params: IPublicInstructorsParams = {}) =>
  useQuery({
    queryKey: ["customer", "public", "instructors", params],
    queryFn: () => getPublicInstructors(params),
    refetchOnWindowFocus: false,
  });