/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";

import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { validationStatus } from "@/lib/config";

import { generateOutstandingReport } from "@/api-req/report";

export const useGenerateOutstandingReport = () => {
  const config = useConfig();

  return useMutation({
    mutationFn: generateOutstandingReport,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    console.log(error);
    const beErr = error?.response?.data?.error as { code?: string; message?: string } | undefined;
    const code = beErr?.code;
    const message = beErr?.message ?? "Please try again later!";
    if (error?.response && error?.response?.status < 500) {
      // PERIOD_NOT_ENDED ditangani di form (tawarkan draft); toast cukup beri kode agar jelas
      return toast.error(code ?? validationStatus(error?.response?.status), {
        id: "error",
        description: message,
        position: "top-center",
      });
    }
    return toast.error(code ?? "Something Wrong!", {
      id: "error",
      description: message,
      position: "top-center",
    });
  }, []);

  const onSuccess = useCallback((_data: any) => {
    toast.success("Success!", {
      id: "sucess",
      description: "Report Generated!!",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
