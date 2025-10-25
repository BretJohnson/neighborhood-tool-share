import { z } from "zod";

const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const FileLikeSchema = z
  .unknown()
  .refine(
    (value) => {
      if (value === undefined || value === null) return true;
      if (typeof File !== "undefined" && value instanceof File) return true;
      if (typeof Blob !== "undefined" && value instanceof Blob) return true;
      if (typeof FileList !== "undefined" && value instanceof FileList) return true;
      return false;
    },
    { message: "Upload must be a valid image file" },
  )
  .refine(
    (value) => {
      if (!value || typeof value === "undefined") return true;
      if (typeof File === "undefined" && typeof Blob === "undefined") return true;
      // Handle FileList
      if (value instanceof FileList) {
        if (value.length === 0) return true;
        const file = value[0];
        return !file.size || file.size <= MAX_FILE_SIZE_BYTES;
      }
      const file = value as File | Blob;
      return !file.size || file.size <= MAX_FILE_SIZE_BYTES;
    },
    { message: "Image must be smaller than 5MB" },
  )
  .refine(
    (value) => {
      if (!value || typeof value === "undefined") return true;
      if (typeof File === "undefined" && typeof Blob === "undefined") return true;
      // Handle FileList
      if (value instanceof FileList) {
        if (value.length === 0) return true;
        const file = value[0];
        return !file.type || ALLOWED_FILE_TYPES.includes(file.type);
      }
      const file = value as File | Blob & { type?: string };
      return !file.type || ALLOWED_FILE_TYPES.includes(file.type);
    },
    {
      message:
        "Unsupported file type. Allowed types: JPEG, PNG, WebP, AVIF",
    },
  );

const CATEGORIES = [
  "Power Tools",
  "Hand Tools",
  "Garden",
  "Ladders",
  "Automotive",
  "Cleaning",
  "Other"
] as const;

export const ToolBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Tool name is required")
    .max(255, "Tool name must be shorter than 255 characters"),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be under ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  model: z
    .string()
    .max(100, "Model number must be shorter than 100 characters")
    .optional()
    .nullable(),
});

export { CATEGORIES };

export const ToolCreateSchema = ToolBaseSchema.extend({
  photo: FileLikeSchema.optional(),
});

export const ToolUpdateSchema = ToolBaseSchema.extend({
  id: z.string().uuid("Tool id must be a valid UUID"),
  photo: FileLikeSchema.optional(),
  removePhoto: z.boolean().optional(),
});

export type ToolCreateInput = z.infer<typeof ToolCreateSchema>;
export type ToolUpdateInput = z.infer<typeof ToolUpdateSchema>;
