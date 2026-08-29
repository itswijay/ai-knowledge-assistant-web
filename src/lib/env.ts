import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  NEXT_PUBLIC_API_BASE_URL: z.url(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cachedPublicEnv: PublicEnv | undefined;

export function parsePublicEnv(
  input: Record<string, string | undefined>,
): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    const invalidFields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ].sort();

    throw new Error(
      `Invalid public environment configuration: ${invalidFields.join(", ")}`,
    );
  }

  return result.data;
}

export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
  }

  return cachedPublicEnv;
}
