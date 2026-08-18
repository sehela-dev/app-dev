import { getPublicLocations } from "@/api-req/customer-app";
import { IPublicLocationsParams } from "@/types/customer-app/public.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicLocations = (params: IPublicLocationsParams = {}) =>
  useQuery({
    queryKey: ["customer", "public", "locations", params],
    queryFn: () => getPublicLocations(params),
    refetchOnWindowFocus: false,
  });