import { getThirdParyApp } from "@/api-req/admin-orders";

import { useQuery } from "@tanstack/react-query";

export const useGetThirdPartyApp = (enroll: boolean) =>
  useQuery({
    queryKey: ["dashboard", "orders", "third-party"],
    queryFn: () => getThirdParyApp(),
    refetchOnWindowFocus: false,
    enabled: !!enroll,
  });
