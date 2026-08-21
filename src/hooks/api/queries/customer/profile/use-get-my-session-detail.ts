import { getMySessionDetail } from "@/api-req/customer-app";

import { useQuery } from "@tanstack/react-query";

export const useGetMySessionDetail = (params: string) =>
  useQuery({
    queryKey: ["user", "profile", "my-session", "my-session-detail", params],
    queryFn: () => getMySessionDetail(params),
    refetchOnWindowFocus: true,
    enabled: !!params,
    // Poll every 5s while payment is pending so status updates after Midtrans payment
    refetchInterval: (res) => {
      const detail = res?.data;
      const isPending =
        detail?.booking_status === "pending_payment" ||
        (detail?.payment?.status && detail.payment.status === "pending");
      return isPending ? 5000 : false;
    },
  });
