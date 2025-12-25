import { getInstructor } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetInstructor = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "instructors", params],
    queryFn: () => getInstructor(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
