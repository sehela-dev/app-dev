/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { validationStatus } from "@/lib/config";
import { updateAdmin } from "@/api-req";

export const useUpdateAdmin = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: updateAdmin,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
        id: "error",
        description: error?.response?.data?.error?.message,
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
      id: "sucess",
      description: "Admin/Manager account updated successfully!",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
