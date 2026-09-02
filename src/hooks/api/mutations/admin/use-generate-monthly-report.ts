/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { validationStatus } from "@/lib/config";
import { generateMonthlyReport } from "@/api-req/instructor";

export const useGenerateMonthlyReport = () => {
  const config = useConfig();
  return useMutation({
    mutationFn: generateMonthlyReport,
    ...config,
  });
};

const useConfig = () => {
  const onError = useCallback((error: AxiosError<any>) => {
    const code = (error?.response?.data as any)?.error?.code;
    // biarkan caller handle PERIOD_NOT_ENDED secara khusus
    if (code === "PERIOD_NOT_ENDED") return;
    if (error?.response && error?.response?.status < 500) {
      return toast.error(validationStatus(error?.response?.status), {
        id: "error",
        description: error?.response?.data?.error?.message ?? error.message,
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
      description: data?.message ?? "Report generated",
      position: "top-center",
    });
  }, []);

  return { onError, onSuccess };
};
