import { userAuthGetProfile, userAuthGetProfileCallback } from "@/api-req/customer-app";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userAuthGetProfile(),
    refetchOnWindowFocus: false,
    enabled,
  });
// userAuthGetProfileCallback

export const useGetProfileCallback = (token: string) =>
  useQuery({
    queryKey: ["user", "profile", "detail", "auth", token],
    queryFn: () => userAuthGetProfileCallback(token),
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
