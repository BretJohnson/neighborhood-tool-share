import { z } from "zod";

export const PHONE_NUMBER_REGEX =
  /^\+?1?\s*(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const UserProfileSchema = z.object({
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
  agreed_to_rules_at: z
    .coerce.date()
    .or(z.string().datetime())
    .transform((value) =>
      value instanceof Date ? value.toISOString() : value,
    ),
});

export const UserProfileUpdateSchema = UserProfileSchema.partial({
  agreed_to_rules_at: true,
}).extend({
  id: z.string().uuid("User id must be a valid UUID"),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;
