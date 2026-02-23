import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getApiUser } from "@/lib/api-auth"

const MAX_SEARCH_LENGTH = 200

export async function GET(request: NextRequest) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "api")
  if (!allowed) return rateLimitResponse(resetMs)

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const search = (searchParams.get("search") || "").slice(0, MAX_SEARCH_LENGTH)

  const where = {
    userId: user.id,
    ...(search
      ? {
          OR: [
            { originalUrl: { contains: search, mode: "insensitive" as const } },
            { customSlug: { contains: search, mode: "insensitive" as const } },
            { shortCode: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { clicks: true } } },
    }),
    prisma.link.count({ where }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return NextResponse.json({
    links: links.map((l) => ({
      id: l.id,
      shortUrl: `${appUrl}/${l.customSlug || l.shortCode}`,
      shortCode: l.customSlug || l.shortCode,
      originalUrl: l.originalUrl,
      title: l.title,
      isActive: l.isActive,
      clicks: l._count.clicks,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
