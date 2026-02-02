import { getInstructorPaymentDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetInstructorSessionPaymentDetails = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "instructors", "instructor-payment-details", "sessions", params],
    queryFn: () => getInstructorPaymentDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
