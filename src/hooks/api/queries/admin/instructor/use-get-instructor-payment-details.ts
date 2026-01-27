import { getInstructorPayments } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetInstructorPaymentDetails = (params: ICommonParams, tabs: string) =>
  useQuery({
    queryKey: ["dashboard", "instructors", "instructor-payments", params],
    queryFn: () => getInstructorPayments(params),
    refetchOnWindowFocus: false,
    enabled: !!params.startDate && !!params.endDate && tabs === "payment",
  });
