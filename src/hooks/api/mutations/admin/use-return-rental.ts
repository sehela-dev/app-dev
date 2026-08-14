import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { validationStatus } from "@/lib/config";
import { returnRental } from "@/api-req";

type MutateError = AxiosError<{ error?: { message?: string } }>;

export const useReturnRental = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: returnRental,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: MutateError) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
        id: "error",
        description: error?.response?.data?.error?.message ?? "Something went wrong",
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
      description: "Rental has been returned!",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
