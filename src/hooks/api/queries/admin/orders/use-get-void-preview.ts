import { getTrxVoidPreview } from "@/api-req/admin-orders";

import { useQuery } from "@tanstack/react-query";

export const useGetVoidPreview = (data?: string) =>
  useQuery({
    queryKey: ["dashboard", "preview-void", "transaction", data],
    queryFn: () => getTrxVoidPreview(data as string),
    refetchOnWindowFocus: false,
    enabled: data !== "",
  });
