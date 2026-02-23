import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateShortCode } from "@/lib/utils/short-code"
import { validateUrl, sanitizeUrl } from "@/lib/utils/url-validator"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getApiUser } from "@/lib/api-auth"
import { RESERVED_SLUGS, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH, SLUG_REGEX } from "@/lib/constants"

const MAX_TITLE_LENGTH = 500

export async function POST(request: NextRequest) {
  const user = await getApiUser(request)

  if (user) {
    // Authenticated: API tier rate limit
    const { allowed, resetMs } = checkRateLimit(user.id, "api")
    if (!allowed) return rateLimitResponse(resetMs)
  } else {
    // Anonymous: public tier rate limit by IP
    const ip = getClientIp(request.headers)
    const { allowed, resetMs } = checkRateLimit(ip, "public")
    if (!allowed) return rateLimitResponse(resetMs)
  }

  let body: { url?: string; customSlug?: string; title?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 })
  }

  if (body.url.length > 2048) {
    return NextResponse.json({ error: "URL too long (max 2048 characters)" }, { status: 400 })
  }

  if (body.title && typeof body.title === "string" && body.title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `Title too long (max ${MAX_TITLE_LENGTH} characters)` },
      { status: 400 }
    )
  }

  const url = sanitizeUrl(body.url)
  const validation = validateUrl(url)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const customSlug = body.customSlug?.trim() || null

  if (customSlug) {
    if (customSlug.length < SLUG_MIN_LENGTH || customSlug.length > SLUG_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Custom slug must be ${SLUG_MIN_LENGTH}-${SLUG_MAX_LENGTH} characters` },
        { status: 400 }
      )
    }
    if (!SLUG_REGEX.test(customSlug)) {
      return NextResponse.json(
        { error: "Custom slug can only contain letters, numbers, and hyphens" },
        { status: 400 }
      )
    }
    if (RESERVED_SLUGS.includes(customSlug.toLowerCase())) {
      return NextResponse.json({ error: "This slug is reserved" }, { status: 400 })
    }

    const existing = await prisma.link.findFirst({
      where: { OR: [{ shortCode: customSlug }, { customSlug }] },
    })
    if (existing) {
      return NextResponse.json({ error: "This slug is already taken" }, { status: 409 })
    }
  }

  const shortCode = customSlug || generateShortCode()

  const link = await prisma.link.create({
    data: {
      shortCode,
      customSlug: customSlug || null,
      originalUrl: url,
      title: body.title?.slice(0, MAX_TITLE_LENGTH) || null,
      userId: user?.id || null,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return NextResponse.json(
    {
      shortUrl: `${appUrl}/${link.customSlug || link.shortCode}`,
      shortCode: link.customSlug || link.shortCode,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
    },
    { status: 201 }
  )
}
