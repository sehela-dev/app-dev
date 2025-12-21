import { getSesionDetailBooking } from "@/api-req/class-session";

import { useQuery } from "@tanstack/react-query";

export const useGetSessionBookings = (params: { id: string; page: number; limit: number }) =>
  useQuery({
    queryKey: ["dashboard", "orders", "session", "session-detail", params],
    queryFn: () => getSesionDetailBooking(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
