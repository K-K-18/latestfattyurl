import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { parseUserAgent } from "@/lib/utils/user-agent"
import { hashIp } from "@/lib/utils/ip-hash"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rate-limiter"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params

  // Rate limit redirects per IP
  const ip = getClientIp(request.headers)
  const { allowed, resetMs } = checkRateLimit(ip, "redirect")
  if (!allowed) return rateLimitResponse(resetMs)

  const link = await prisma.link.findFirst({
    where: {
      OR: [{ shortCode }, { customSlug: shortCode }],
      isActive: true,
    },
  })

  if (!link) {
    return NextResponse.redirect(new URL("/link-not-found", request.url), 302)
  }

  // Check expiry
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/link-not-found", request.url), 302)
  }

  // Password protected links redirect to a password page
  if (link.password) {
    return NextResponse.redirect(
      new URL(`/p/${link.shortCode}`, request.url),
      302
    )
  }

  const response = NextResponse.redirect(link.originalUrl, 301)

  // Set cache headers for CDN
  response.headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
  )

  // Log click asynchronously — fire and forget, don't slow down redirect
  const ua = request.headers.get("user-agent")
  const referer = request.headers.get("referer")
  const country = request.headers.get("x-vercel-ip-country") || "XX"
  const city = request.headers.get("x-vercel-ip-city") || "Unknown"
  const { deviceType, browser, os } = parseUserAgent(ua)

  prisma.click
    .create({
      data: {
        linkId: link.id,
        referrer: referer,
        userAgent: ua,
        country,
        city,
        deviceType,
        browser,
        os,
        ipHash: hashIp(ip),
      },
    })
    .catch(() => {}) // Non-critical — don't block redirect

  return response
}
