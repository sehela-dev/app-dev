import { useQuery } from "@tanstack/react-query";

import { getPublicBookingDetail } from "@/api-req/customer-app";
import { TGetPublicBookingDetail } from "@/types/customer-app/public.interface";

export const useGetPublicBookingDetail = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ["public", "booking", "detail", id],
    queryFn: () => getPublicBookingDetail(id!),
    enabled: !!id && enabled,
    refetchInterval: enabled ? 3000 : false,
    refetchIntervalInBackground: true,
  });
};