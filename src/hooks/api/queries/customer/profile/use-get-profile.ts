import { userAuthGetProfile, userAuthGetProfileCallback } from "@/api-req/customer-app";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = (accessToken?: string) =>
  useQuery({
    queryKey: ["user", "profile", accessToken],
    queryFn: () => userAuthGetProfile(),
    refetchOnWindowFocus: false,
    enabled: !!accessToken,
  });
// userAuthGetProfileCallback

export const useGetProfileCallback = (token: string) =>
  useQuery({
    queryKey: ["user", "profile", "detail", "auth", token],
    queryFn: () => userAuthGetProfileCallback(token),
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
