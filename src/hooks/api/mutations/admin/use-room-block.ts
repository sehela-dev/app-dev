/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { createRoomBlock, deleteRoomBlock } from "@/api-req/class-room";
import { validationStatus } from "@/lib/config";

const useMutationConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
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
      description: data.message,
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};

export const useCreateRoomBlock = () => {
  const config = useMutationConfig();
  return useMutation({ mutationFn: createRoomBlock, ...config });
};

export const useDeleteRoomBlock = () => {
  const config = useMutationConfig();
  return useMutation({ mutationFn: deleteRoomBlock, ...config });
};
