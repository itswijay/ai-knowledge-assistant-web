import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required.")
    .max(120, "Organization name must be 120 characters or fewer."),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
