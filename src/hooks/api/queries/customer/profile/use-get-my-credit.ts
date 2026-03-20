import { getMyCredits } from "@/api-req/customer-app/credits";
import { useQuery } from "@tanstack/react-query";

export const useGetMyCredits = () =>
  useQuery({
    queryKey: ["user", "profile", "my-credits"],
    queryFn: () => getMyCredits(),
    refetchOnWindowFocus: false,
  });
