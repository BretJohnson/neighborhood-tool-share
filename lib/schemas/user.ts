import { z } from "zod";

export const PHONE_NUMBER_REGEX =
  /^\+?1?\s*(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

// Export for profile edit form
export const BaseUserDetailsSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Full name must be shorter than 255 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(1000, "Address must be shorter than 1000 characters"),
  phone_number: z
    .string()
    .regex(PHONE_NUMBER_REGEX, "Enter a valid US phone number"),
});

export const UserProfileSchema = BaseUserDetailsSchema.extend({
  agreed_to_rules_at: z
    .coerce.date()
    .or(z.string().datetime())
    .transform((value) =>
      value instanceof Date ? value.toISOString() : value,
    ),
});

export const UserSignupSchema = BaseUserDetailsSchema.extend({
  agreeToRules: z
    .boolean()
    .refine((value) => value === true, {
      message: "You must agree to the Abbington tool share rules",
    }),
});

export const UserProfileUpdateSchema = BaseUserDetailsSchema.partial().extend({
  id: z.string().uuid("User id must be a valid UUID"),
  agreed_to_rules_at: z
    .string()
    .datetime()
    .optional(),
});

export type BaseUserDetails = z.infer<typeof BaseUserDetailsSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;
export type UserSignupInput = z.infer<typeof UserSignupSchema>;
