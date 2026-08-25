/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { repayBooking } from "@/api-req/customer-app";

export const useRepayBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repayBooking,
    ...useConfig(queryClient),
  });
};

const useConfig = (queryClient: ReturnType<typeof useQueryClient>) => {
  const onError = useCallback(
    (error: AxiosError<any>) => {
      const responseError = error?.response?.data?.error;
      // 410 BOOKING_EXPIRED — 15m lazy expiry, pending_payment → expired
      if (responseError?.code === "BOOKING_EXPIRED" || error?.response?.status === 410) {
        queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
        return toast.error("Booking Expired", {
          id: "error",
          description: responseError?.message ?? "Payment window 15m exceeded (payment_expired). Please make a new booking.",
          position: "top-center",
        });
      }
      if (error?.response && error?.response?.status < 500) {
        return toast.error(responseError?.code ?? "ERROR", {
          id: "error",
          description: responseError?.message ?? "Unable to retry payment. Please try again.",
          position: "top-center",
        });
      }
      return toast.error("Something Wrong!", {
        id: "error",
        description: "Please try again later!",
        position: "top-center",
      });
    },
    [queryClient],
  );

  const onSuccess = useCallback(
    (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
      queryClient.invalidateQueries({ queryKey: ["user", "payments"] });
      toast.success("New Payment Session Created!", {
        id: "success",
        description: "Redirecting to payment page...",
        position: "top-center",
      });
      // Return data so component can use it for redirect
      return data;
    },
    [queryClient],
  );

  return { onError, onSuccess };
};
