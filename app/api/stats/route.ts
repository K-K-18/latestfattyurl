import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rate-limiter"

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { allowed, resetMs } = checkRateLimit(ip, "public")
  if (!allowed) return rateLimitResponse(resetMs)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalLinks, linksToday] = await Promise.all([
    prisma.link.count(),
    prisma.link.count({
      where: { createdAt: { gte: today } },
    }),
  ])

  return NextResponse.json({ totalLinks, linksToday })
}
