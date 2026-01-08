/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminLoginRequest } from "@/api-req/user";
import { validationStatus } from "@/lib/config";

export const useLoginAdmin = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: adminLoginRequest,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error.response.status), {
        id: "error",
        description: error?.response?.data.msg,
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
    toast.success("Login Success", {
      id: "sucess",
      description: data.message,
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
