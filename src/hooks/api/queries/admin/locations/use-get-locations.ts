import { getRoomLocations } from "@/api-req/locations";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetLocations = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "locations", "list", params],
    queryFn: () => getRoomLocations(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
