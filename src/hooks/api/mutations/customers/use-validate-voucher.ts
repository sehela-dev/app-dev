/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { validateVoucher } from "@/api-req/customer-app";

export const useValidateVoucher = () => {
  return useMutation({
    mutationFn: validateVoucher,
  });
};

export type ValidateVoucherError = AxiosError<any>;
