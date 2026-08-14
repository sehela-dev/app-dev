import { getRentalList } from "@/api-req";
import { IRentalListParams } from "@/types/rental.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetRentals = (params: IRentalListParams) =>
  useQuery({
    queryKey: ["dashboard", "rentals", params],
    queryFn: () => getRentalList(params),
    refetchOnWindowFocus: false,
  });
