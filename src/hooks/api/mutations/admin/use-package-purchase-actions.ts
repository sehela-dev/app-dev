import { adjustPackagePurchaseCredits, overridePackagePurchaseExpiry } from "@/api-req";
import { TAdjustPackagePurchaseCredits, TOverridePackagePurchaseExpiry } from "@/types/package-purchase.interface";
import { useMutation } from "@tanstack/react-query";

export const useAdjustPackagePurchaseCredits = () =>
  useMutation<Awaited<ReturnType<TAdjustPackagePurchaseCredits>>, Error, Parameters<TAdjustPackagePurchaseCredits>[0]>({
    mutationFn: adjustPackagePurchaseCredits,
  });

export const useOverridePackagePurchaseExpiry = () =>
  useMutation<Awaited<ReturnType<TOverridePackagePurchaseExpiry>>, Error, Parameters<TOverridePackagePurchaseExpiry>[0]>({
    mutationFn: overridePackagePurchaseExpiry,
  });
