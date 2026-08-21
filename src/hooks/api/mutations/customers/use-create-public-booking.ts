/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPublicBooking } from "@/api-req/customer-app";

export const useCreatePublicBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPublicBooking,
    ...useConfig(queryClient),
  });
};

const useConfig = (queryClient: ReturnType<typeof useQueryClient>) => {
  const onError = useCallback((error: AxiosError<any>) => {
    const responseError = error?.response?.data?.error;
    if (error?.response && error?.response?.status < 500) {
      return toast.error(responseError?.code ?? "ERROR", {
        id: "error",
        description: responseError?.message ?? "Something went wrong. Please try again.",
        position: "top-center",
      });
    }
    return toast.error("Something Wrong!", {
      id: "error",
      description: "Please try again later!",
      position: "top-center",
    });
  }, []);

  const onSuccess = useCallback(
    (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
      toast.success("Booking Created!", {
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