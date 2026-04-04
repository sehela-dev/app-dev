import { z } from "zod";

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const authLoginSchema = z.object({
  email: z.string().email().min(1, { message: "Required" }),
  password: z.string().min(8, { message: "Required!" }),
});

export type AuthLoginFormValues = z.infer<typeof authLoginSchema>;

export const authSignUpSchema = z
  .object({
    full_name: z.string().min(1, { message: "Full name is required" }),

    // phone: digits only 10-13
    phone: z
      .string()
      .min(10, { message: "Phone must be at least 10 digits" })
      .max(13, { message: "Phone max 13 digits" })
      .regex(/^\d+$/, { message: "Phone must contain only numbers" }),

    instagram_username: z.string().optional(),
    medical_notes: z.string().optional(),

    gender: z.string().min(1, { message: "Gender is required" }),

    date_of_birth: z.string().min(1, { message: "Date of birth is required" }),

    // ✅ RHF compatible file validation
    photo: z
      .any()
      .optional()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
        message: "Max file size is 2MB",
      })
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png, .webp allowed",
      }),

    photo_consent: z.boolean().optional(),

    tnc_agreed: z.boolean().refine((val) => val === true, {
      message: "You must agree to terms",
    }),
    email: z.string().email().min(1, { message: "Required" }),
    password: z.string().min(8, { message: "Required!" }),
    confirm_password: z.string().min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // attach error to field
  });
export type AuthSignUpFormValues = z.infer<typeof authSignUpSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Required!" }),
    confirm_password: z.string().min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // attach error to field
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
