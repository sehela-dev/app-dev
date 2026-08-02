import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().min(1, "Category is required"),
  type: z.enum(["buy", "rent"]),
  description: z.string().min(1, "Description is required"),
  photos: z.array(z.any()).optional(),
  variants: z
    .array(
      z.object({
        variant_name: z.string().min(1, "Variant name is required"),
        sku: z.string().min(1, "SKU is required"),

        price_idr: z
          .string()
          .min(1, "Price is required")
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "Price must be a valid positive number",
          }),
        inventory: z
          .array(
            z.object({
              location_id: z.string().min(1, "Location ID is required"),
              stock_total: z
                .string()
                .min(1, "Stock is required")
                .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                  message: "Stock must be a valid number",
                }),
            }),
          )
          .min(1, "At least one inventory location is required"),
        location: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(), // Not sent to backend, only for UI
      }),
    )
    .optional(),
});

export const variantSchema = z.object({
  variants: z.array(
    z.object({
      variant_name: z.string().min(1, "Variant name is required"),
      sku: z.string().min(1, "SKU is required"),

      price_idr: z
        .string()
        .min(1, "Price is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Price must be a valid positive number",
        }),
      inventory: z
        .array(
          z.object({
            location_id: z.string().min(1, "Location ID is required"),
            stock_total: z
              .string()
              .min(1, "Stock is required")
              .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                message: "Stock must be a valid number",
              }),
          }),
        )
        .min(1, "At least one inventory location is required"),
      location: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        )
        .optional(), // Not sent to backend, only for UI
    }),
  ),
});

export type CreateProductFormValues = z.infer<typeof ProductFormSchema>;
export type UpdateVariantsFormValues = z.infer<typeof variantSchema>;

// price_idr: z
// .string()
// .min(1, "Price is required")
// .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
//   message: "Price must be a valid positive number",
// }),
// stock: z
// .string()
// .min(1, "Stock is required")
// .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
//   message: "Stock must be a valid number",
// }),
