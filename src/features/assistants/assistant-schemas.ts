import { z } from "zod";

function isValidLogoUrl(val: string | undefined | null): boolean {
  if (!val || val.trim() === "") return true;
  try {
    const url = new URL(val.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!url.hostname) return false;
    if (url.username || url.password) return false;
    return val.trim().length <= 2048;
  } catch {
    return false;
  }
}

export const createAssistantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Assistant name is required.")
    .max(100, "Assistant name must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1,000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  welcomeMessage: z
    .string()
    .trim()
    .max(500, "Welcome message must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  assistantInstructions: z
    .string()
    .trim()
    .max(4000, "Assistant instructions must be 4,000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color code (e.g. #2563EB).")
    .optional()
    .or(z.literal("")),
});

export type CreateAssistantValues = z.infer<typeof createAssistantSchema>;

export const appearanceSchema = z.object({
  welcomeMessage: z
    .string()
    .trim()
    .min(1, "Welcome message is required.")
    .max(500, "Welcome message must be 500 characters or fewer."),
  logoUrl: z
    .string()
    .trim()
    .max(2048, "Logo URL must be 2,048 characters or fewer.")
    .refine(
      (val) => isValidLogoUrl(val),
      "Logo URL must be an absolute HTTP or HTTPS URL without credentials.",
    )
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Primary color must be a valid hex color code (e.g. #2563EB).",
    ),
});

export type AppearanceValues = z.infer<typeof appearanceSchema>;

export const settingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Assistant name is required.")
    .max(100, "Assistant name must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1,000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  assistantInstructions: z
    .string()
    .trim()
    .min(1, "Assistant instructions are required.")
    .max(4000, "Assistant instructions must be 4,000 characters or fewer."),
});

export type SettingsValues = z.infer<typeof settingsSchema>;
