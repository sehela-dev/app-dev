import { getPublicCreditPackage } from "@/api-req";
import { useQuery } from "@tanstack/react-query";

// A2: public detail — hidden/inactive → 404 (caller renders "not available" page).
export const useGetPublicCreditPackageDetail = (id: string | null) =>
  useQuery({
    queryKey: ["customer", "public", "credit-packages", "detail", id],
    queryFn: () => getPublicCreditPackage(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
    retry: 1,
  });
