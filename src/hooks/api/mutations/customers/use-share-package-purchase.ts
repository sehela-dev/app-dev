import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sharePackagePurchase } from "@/api-req/customer-app";

export const useSharePackagePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, email }: { purchaseId: string; email: string }) =>
      sharePackagePurchase(purchaseId, { email }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-credits"] });
    },
  });
};
