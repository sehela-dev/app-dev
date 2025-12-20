import { getClassRoom } from "@/api-req";

import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetClassRoo = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "class-room", "class", params],
    queryFn: () => getClassRoom(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
