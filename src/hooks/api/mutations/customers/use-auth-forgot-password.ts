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

const FRIENDLY_ERRORS: Record<string, string> = {
  EMAIL_NOT_FOUND: "Email not registered — check or sign up",
  ACCOUNT_INACTIVE: "Account inactive — contact support",
  EMAIL_SEND_FAILED: "Mail failed, please retry",
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    const data = error?.response?.data as { error?: { code?: string; message?: string } } | undefined;
    const code = data?.error?.code;
    const serverMsg = data?.error?.message;
    if (error?.response && (error.response.status === 400 || error.response.status === 403 || error.response.status === 404)) {
      return toast.error(code ?? "Error", {
        id: "error",
        description: (code && FRIENDLY_ERRORS[code]) ?? serverMsg ?? "Please check your input.",
        position: "top-center",
      });
    }
    if (error?.response && error?.response?.status < 500) {
      return toast.error(code ?? "Error", {
        id: "error",
        description: serverMsg ?? "Please try again.",
        position: "top-center",
      });
    }
    // 500 EMAIL_SEND_FAILED / INTERNAL_ERROR etc — show server message if present
    if (code && serverMsg) {
      return toast.error(code, {
        id: "error",
        description: FRIENDLY_ERRORS[code] ?? serverMsg,
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
    const msg: string = data?.data?.message ?? data?.message ?? "Password reset link has been sent to your email.";
    toast.success("Success!", {
      id: "sucess",
      description: msg,
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
