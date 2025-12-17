/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { createNewClassCategory } from "@/api-req/class-session";
import { validationStatus } from "@/lib/config";

export const useCreateClassSession = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: createNewClassCategory,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
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
