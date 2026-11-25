import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { settleBalance } from "@/api-req";
import type { ISettleBalancePayload } from "@/types/orders.interface";

export const useSettleBalance = (paymentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ISettleBalancePayload) => settleBalance(paymentId, payload),
    onSuccess: (res) => {
      const remaining = res?.data?.remaining_idr ?? 0;
      toast.success("Balance recorded", {
        id: "success",
        description: remaining > 0 ? "Partial payment recorded. The rest is still due." : "This transaction is now fully paid.",
        position: "top-center",
      });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "orders"] });
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      toast.error("Could not record the balance", {
        id: "error",
        description: error?.response?.data?.error?.message ?? "Please try again.",
        position: "top-center",
      });
    },
  });
};
