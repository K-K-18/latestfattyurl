import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { validateUrl, sanitizeUrl } from "@/lib/utils/url-validator"
import { hashPassword } from "@/lib/utils/password"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { RESERVED_SLUGS, SLUG_MIN_LENGTH, SLUG_MAX_LENGTH, SLUG_REGEX } from "@/lib/constants"

const MAX_TITLE_LENGTH = 500

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const { id } = await params

  const link = await prisma.link.findUnique({
    where: { id, userId: user.id },
    include: { _count: { select: { clicks: true } } },
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return NextResponse.json({
    id: link.id,
    shortUrl: `${appUrl}/${link.customSlug || link.shortCode}`,
    shortCode: link.customSlug || link.shortCode,
    originalUrl: link.originalUrl,
    title: link.title,
    isActive: link.isActive,
    password: !!link.password,
    expiresAt: link.expiresAt,
    clicks: link._count.clicks,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const { id } = await params

  const link = await prisma.link.findUnique({
    where: { id, userId: user.id },
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (typeof body.originalUrl === "string") {
    if (body.originalUrl.length > 2048) {
      return NextResponse.json({ error: "URL too long (max 2048 characters)" }, { status: 400 })
    }
    const url = sanitizeUrl(body.originalUrl)
    const validation = validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    updates.originalUrl = url
  }

  if (typeof body.title === "string") {
    if (body.title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title too long (max ${MAX_TITLE_LENGTH} characters)` },
        { status: 400 }
      )
    }
    updates.title = body.title
  }

  if (typeof body.isActive === "boolean") {
    updates.isActive = body.isActive
  }

  // Hash password before storing
  if (typeof body.password === "string") {
    if (body.password.length > 128) {
      return NextResponse.json({ error: "Password too long (max 128 characters)" }, { status: 400 })
    }
    if (body.password.length > 0) {
      updates.password = await hashPassword(body.password)
    } else {
      // Empty string = remove password
      updates.password = null
    }
  }

  if (body.expiresAt !== undefined) {
    if (body.expiresAt === null) {
      updates.expiresAt = null
    } else if (typeof body.expiresAt === "string") {
      const date = new Date(body.expiresAt)
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 })
      }
      updates.expiresAt = date
    }
  }

  if (typeof body.customSlug === "string") {
    const slug = body.customSlug.trim()
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Slug must be ${SLUG_MIN_LENGTH}-${SLUG_MAX_LENGTH} chars` },
        { status: 400 }
      )
    }
    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        { error: "Slug can only contain letters, numbers, and hyphens" },
        { status: 400 }
      )
    }
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      return NextResponse.json({ error: "Slug is reserved" }, { status: 400 })
    }
    const existing = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: slug }, { customSlug: slug }],
        NOT: { id },
      },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
    }
    updates.customSlug = slug
  }

  const updated = await prisma.link.update({
    where: { id },
    data: updates,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return NextResponse.json({
    id: updated.id,
    shortUrl: `${appUrl}/${updated.customSlug || updated.shortCode}`,
    shortCode: updated.customSlug || updated.shortCode,
    originalUrl: updated.originalUrl,
    title: updated.title,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const { id } = await params

  const link = await prisma.link.findUnique({
    where: { id, userId: user.id },
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  await prisma.link.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
