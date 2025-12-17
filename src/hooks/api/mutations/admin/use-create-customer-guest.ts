/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { validationStatus } from "@/lib/config";
import { createNewGuest } from "@/api-req/admin-orders";

export const useCreateNewGuest = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: createNewGuest,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(error.response?.data.error.code, {
        id: "error",
        description: error?.response?.data.error.message,
        position: "bottom-center",
      });
    }
    return toast.error("Something Wrong!", {
      id: "error",
      description: "Please try again later!",
      position: "bottom-center",
    });
  }, []);

  const onSuccess = useCallback((data: any) => {
    toast.success(data.message, {
      id: "sucess",
      description: data.message,
      position: "bottom-center",
    });
  }, []);

  return { onError, onSuccess };
};
