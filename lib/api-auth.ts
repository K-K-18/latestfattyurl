import { NextRequest } from "next/server"
import { prisma } from "./db"
import { auth } from "./auth"
import { createHash } from "crypto"

/**
 * Hash an API key with SHA-256 for secure storage lookup.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

/**
 * Get user from API key in Authorization header.
 * Supports both legacy plaintext lookup and hashed lookup.
 */
export async function getApiUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const apiKey = authHeader.slice(7)
  if (!apiKey || apiKey.length < 10) return null

  // Try hashed lookup first (new keys)
  const hash = hashApiKey(apiKey)
  const userByHash = await prisma.user.findFirst({
    where: { apiKeyHash: hash },
  })
  if (userByHash) return userByHash

  // Fall back to plaintext lookup (legacy keys)
  const userByKey = await prisma.user.findFirst({
    where: { apiKey: apiKey },
  })

  // If found by plaintext, silently upgrade to hashed
  if (userByKey) {
    prisma.user
      .update({
        where: { id: userByKey.id },
        data: { apiKeyHash: hash },
      })
      .catch(() => {}) // Non-critical
  }

  return userByKey
}

/**
 * Get authenticated user from either API key or session.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // Try API key first (faster, no cookie needed)
  const apiUser = await getApiUser(request)
  if (apiUser) return apiUser

  // Fall back to session auth
  const session = await auth()
  if (session?.user?.id) {
    return prisma.user.findUnique({ where: { id: session.user.id } })
  }

  return null
}
