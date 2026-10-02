import { z } from "zod";

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
