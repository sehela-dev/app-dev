import { getRoomLocationsDetail } from "@/api-req/locations";

import { useQuery } from "@tanstack/react-query";

export const useGetLocationDetail = (id: string) =>
  useQuery({
    queryKey: ["dashboard", "locations", "detail", id],
    queryFn: () => getRoomLocationsDetail(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
