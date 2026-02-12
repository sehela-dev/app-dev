/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { deleteCustomer } from "@/api-req/customer";

export const useDeleteCustomer = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: deleteCustomer,
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
      description: "Member data has been deleted!",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
