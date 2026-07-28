import { z } from "zod";

const reason = z.string().trim().min(1, "Reason is required").max(500, "Reason must be 500 characters or fewer");

export const creditAdjustmentSchema = z.object({
  direction: z.enum(["add", "remove"]),
  amount: z.number().int("Enter a whole number of credits").positive("Enter at least one credit"),
  reason,
});

export const expiryOverrideSchema = z.object({
  expires_at: z.string().min(1, "Expiry date is required"),
  reason,
});

export const clearExpirySchema = z.object({ reason });

export type CreditAdjustmentFormValues = z.infer<typeof creditAdjustmentSchema>;
export type ExpiryOverrideFormValues = z.infer<typeof expiryOverrideSchema>;
export type ClearExpiryFormValues = z.infer<typeof clearExpirySchema>;
