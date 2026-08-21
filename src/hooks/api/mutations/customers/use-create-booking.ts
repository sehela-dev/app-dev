/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBooking } from "@/api-req/customer-app";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
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
    () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-credits"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile", "my-session"] });
      toast.success("Booking Confirmed!", {
        id: "success",
        description: "Your spot is confirmed. See you in class!",
        position: "top-center",
      });
    },
    [queryClient],
  );

  return { onError, onSuccess };
};
