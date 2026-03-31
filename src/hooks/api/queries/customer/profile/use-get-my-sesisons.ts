import { getMySessions } from "@/api-req/customer-app";

import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetMySessions = (params: ICommonParams) =>
  useQuery({
    queryKey: ["user", "profile", "my-session", params],
    queryFn: () => getMySessions(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
