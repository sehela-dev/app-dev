import { getCreditPackages } from "@/api-req";

import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetCreditPackage = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "credit-package", "credit", params],
    queryFn: () => getCreditPackages(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
