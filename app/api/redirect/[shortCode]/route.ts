import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword, hashPassword } from "@/lib/utils/password"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rate-limiter"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params

  // Rate limit password attempts per shortCode
  const { allowed, resetMs } = checkRateLimit(shortCode, "password")
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many attempts. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(resetMs / 1000)),
        },
      }
    )
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const password = body?.password
  if (!password || typeof password !== "string" || password.length > 128) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const link = await prisma.link.findFirst({
    where: {
      OR: [{ shortCode }, { customSlug: shortCode }],
      isActive: true,
    },
  })

  if (!link || !link.password) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { valid, needsUpgrade } = await verifyPassword(password, link.password)

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 })
  }

  // Silently upgrade legacy plaintext passwords to bcrypt
  if (needsUpgrade) {
    const hashed = await hashPassword(password)
    prisma.link
      .update({ where: { id: link.id }, data: { password: hashed } })
      .catch(() => {}) // Non-critical, don't block response
  }

  return NextResponse.json({ url: link.originalUrl })
}
