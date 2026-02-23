import { z } from "zod"

/**
 * Environment variable validation.
 * Validates all required env vars at import time with clear error messages.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),

  // Auth
  AUTH_SECRET: z.string().min(10, "AUTH_SECRET must be at least 10 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),

  // OAuth (optional — app works without them, just no social login)
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GITHUB_ID: z.string().optional().default(""),
  GITHUB_SECRET: z.string().optional().default(""),

  // Email (optional)
  RESEND_API_KEY: z.string().optional().default(""),

  // Security
  IP_HASH_SECRET: z.string().min(10, "IP_HASH_SECRET must be at least 10 characters").optional().default("dev-ip-hash-secret-change-in-production"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default("FattyURL"),

  // Runtime
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.issues
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n")

    console.error(
      `\n❌ Invalid environment variables:\n${formatted}\n\nPlease check your .env file.\n`
    )

    // In production, throw. In dev, warn but continue
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables")
    }
  }

  return result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>)
}

export const env = validateEnv()
