import { userAuthGetProfile } from "@/api-req/customer-app";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = (isLoggedin: boolean) =>
  useQuery({
    queryKey: ["user", "profile", "detail", "auth", isLoggedin],
    queryFn: () => userAuthGetProfile(),
    refetchOnWindowFocus: false,
    enabled: isLoggedin,
  });
