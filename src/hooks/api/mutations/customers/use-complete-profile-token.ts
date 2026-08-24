/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { completeProfileWithToken } from "@/api-req/customer-app/auth";

export const useCompleteProfileWithToken = () => {
  const config = useConfig();
  return useMutation({ mutationFn: completeProfileWithToken, ...config });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    const data = error?.response?.data as { error?: { code?: string; message?: string } } | undefined;
    const code = data?.error?.code;
    const msg = data?.error?.message;
    if (code === "ALREADY_COMPLETED") {
      return toast.error("Already completed", { id: "error", description: "Profile already completed.", position: "top-center" });
    }
    if (code === "INVALID_TOKEN") {
      return toast.error("Link expired", { id: "error", description: "Link expired (15m) or already used — request a new one.", position: "top-center" });
    }
    if (error?.response && error.response.status < 500) {
      return toast.error(code ?? "Error", { id: "error", description: msg ?? "Please check your input.", position: "top-center" });
    }
    if (code && msg) return toast.error(code, { id: "error", description: msg, position: "top-center" });
    return toast.error("Something Wrong!", { id: "error", description: "Please try again later!", position: "top-center" });
  }, []);
  const onSuccess = useCallback((data: any) => {
    const d = data?.data;
    if (d?.session) toast.success("Profile completed!", { id: "sucess", description: "Profile completed — you are now logged in.", position: "top-center" });
    else toast.success("Profile completed!", { id: "sucess", description: "Done — please login.", position: "top-center" });
  }, []);
  return { onError, onSuccess };
};
