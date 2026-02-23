import { NextRequest, NextResponse } from "next/server"
import { checkSlugAvailability } from "@/app/actions"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rate-limiter"

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { allowed, resetMs } = checkRateLimit(ip, "public")
  if (!allowed) return rateLimitResponse(resetMs)

  const slug = new URL(request.url).searchParams.get("slug") || ""
  if (slug.length > 50) {
    return NextResponse.json({ available: false })
  }

  const available = await checkSlugAvailability(slug)
  return NextResponse.json({ available })
}
