import { adjustPackagePurchaseCredits, overridePackagePurchaseExpiry, sharePackagePurchaseAdmin } from "@/api-req";
import { TAdjustPackagePurchaseCredits, TOverridePackagePurchaseExpiry } from "@/types/package-purchase.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAdjustPackagePurchaseCredits = () =>
  useMutation<Awaited<ReturnType<TAdjustPackagePurchaseCredits>>, Error, Parameters<TAdjustPackagePurchaseCredits>[0]>({
    mutationFn: adjustPackagePurchaseCredits,
  });

export const useOverridePackagePurchaseExpiry = () =>
  useMutation<Awaited<ReturnType<TOverridePackagePurchaseExpiry>>, Error, Parameters<TOverridePackagePurchaseExpiry>[0]>({
    mutationFn: overridePackagePurchaseExpiry,
  });

export const useSharePackagePurchaseAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email, user_id }: { id: string; email?: string; user_id?: string }) =>
      sharePackagePurchaseAdmin(id, { email, user_id }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "package-purchase", "detail", variables.id] });
    },
  });
};
