/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { adminChangePasswordRequest } from "@/api-req";
import { validationStatus } from "@/lib/config";

export const useAdminChangePassword = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: adminChangePasswordRequest,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
        id: "error",
        description: error?.response?.data?.error?.message ?? error?.response?.data?.message,
        position: "top-center",
      });
    }
    return toast.error("Something Wrong!", {
      id: "error",
      description: "Please try again later!",
      position: "top-center",
    });
  }, []);

  const onSuccess = useCallback(() => {
    toast.success("Success!", {
      id: "success",
      description: "Password updated!",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
