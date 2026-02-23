import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"

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
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "100")))
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where = {
    linkId: id,
    ...(from || to
      ? {
          clickedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  }

  const [clicks, total] = await Promise.all([
    prisma.click.findMany({
      where,
      orderBy: { clickedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        clickedAt: true,
        referrer: true,
        country: true,
        city: true,
        deviceType: true,
        browser: true,
        os: true,
      },
    }),
    prisma.click.count({ where }),
  ])

  return NextResponse.json({ clicks, total })
}
