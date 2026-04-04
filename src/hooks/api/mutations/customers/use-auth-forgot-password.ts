/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { userAuthForgotPassword } from "@/api-req/customer-app";

export const useAuthForgotPassword = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: userAuthForgotPassword,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    if (error?.response && error?.response?.status < 500) {
      return toast.error(error?.response?.data?.error.code, {
        id: "error",
        description: error?.response?.data?.error.message,
        position: "top-center",
      });
    }
    return toast.error("Something Wrong!", {
      id: "error",
      description: "Please try again later!",
      position: "top-center",
    });
  }, []);

  const onSuccess = useCallback((data: any) => {
    toast.success("Success!", {
      id: "sucess",
      description: "If an account exists with that email, a password reset link has been sent.",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
