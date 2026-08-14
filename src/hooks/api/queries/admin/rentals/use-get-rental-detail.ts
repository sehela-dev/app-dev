import { getRentalDetail } from "@/api-req";
import { useQuery } from "@tanstack/react-query";

export const useGetRentalDetail = (id?: string) =>
  useQuery({
    queryKey: ["dashboard", "rentals", "detail", id],
    queryFn: () => getRentalDetail(id as string),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
