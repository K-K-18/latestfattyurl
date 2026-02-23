import { z } from "zod"
import { SLUG_MIN_LENGTH, SLUG_MAX_LENGTH } from "@/lib/constants"

// --- Shared field schemas ---

const urlField = z
  .string()
  .min(1, "URL is required")
  .max(2048, "URL too long (max 2048 characters)")

const titleField = z
  .string()
  .max(500, "Title too long (max 500 characters)")
  .optional()

const slugField = z
  .string()
  .min(SLUG_MIN_LENGTH, `Slug must be at least ${SLUG_MIN_LENGTH} characters`)
  .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, and hyphens")

const passwordField = z
  .string()
  .max(128, "Password too long (max 128 characters)")

// --- API Route Schemas ---

export const shortenInputSchema = z.object({
  url: urlField,
  customSlug: slugField.optional().nullable(),
  title: titleField,
})

export const updateLinkSchema = z.object({
  originalUrl: urlField.optional(),
  title: titleField.nullable(),
  customSlug: slugField.optional(),
  isActive: z.boolean().optional(),
  password: passwordField.optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200, "Search too long").default(""),
})

export const clicksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const passwordCheckSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
})

// --- Helper to format Zod errors ---

export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
}

export function formatZodFieldErrors(
  error: z.ZodError
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  for (const e of error.issues) {
    const key = e.path.join(".") || "_root"
    if (!formatted[key]) formatted[key] = []
    formatted[key].push(e.message)
  }
  return formatted
}
