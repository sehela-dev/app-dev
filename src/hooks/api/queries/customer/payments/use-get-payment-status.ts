import { getPaymentStatus } from "@/api-req/customer-app";

import { useQuery } from "@tanstack/react-query";

const SUCCESS_STATUSES = ["settlement", "capture"];
const FAILURE_STATUSES = ["deny", "cancel", "expire", "failure"];

export const useGetPaymentStatus = (orderId: string | null) =>
  useQuery({
    queryKey: ["user", "payments", "status", orderId],
    queryFn: () => getPaymentStatus(orderId!),
    enabled: !!orderId,
    refetchOnWindowFocus: true,
    // Poll every 3s until Midtrans webhook settles the payment, then stop
    refetchInterval: (res) => {
      const status = res?.data?.transaction_status;
      if (!status) return 3000;
      const isFinal = SUCCESS_STATUSES.includes(status) || FAILURE_STATUSES.includes(status);
      return isFinal ? false : 3000;
    },
    retry: 1,
  });
