import { getMyCredits } from "@/api-req/customer-app/credits";
import { IMyCreditParams } from "@/types/customer-app/my-credit.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetMyCredits = (params?: IMyCreditParams) =>
  useQuery({
    queryKey: ["user", "profile", "my-credits", params],
    queryFn: () => getMyCredits(params),
    refetchOnWindowFocus: false,
  });
