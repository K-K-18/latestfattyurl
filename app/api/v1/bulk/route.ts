import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateShortCode } from "@/lib/utils/short-code"
import { validateUrl, sanitizeUrl } from "@/lib/utils/url-validator"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"

const MAX_BULK_SIZE = 100

interface BulkLinkInput {
  url: string
  customSlug?: string
  title?: string
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. API key required for bulk creation." }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "api")
  if (!allowed) return rateLimitResponse(resetMs)

  let body: { links?: BulkLinkInput[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.links || !Array.isArray(body.links)) {
    return NextResponse.json({ error: "links array is required" }, { status: 400 })
  }

  if (body.links.length === 0) {
    return NextResponse.json({ error: "At least one link is required" }, { status: 400 })
  }

  if (body.links.length > MAX_BULK_SIZE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BULK_SIZE} links per batch` },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const results: Array<{
    index: number
    success: boolean
    shortUrl?: string
    shortCode?: string
    error?: string
  }> = []

  for (let i = 0; i < body.links.length; i++) {
    const link = body.links[i]

    if (!link.url) {
      results.push({ index: i, success: false, error: "URL is required" })
      continue
    }

    const url = sanitizeUrl(link.url)
    const validation = validateUrl(url)
    if (!validation.valid) {
      results.push({ index: i, success: false, error: validation.error })
      continue
    }

    try {
      let shortCode: string

      if (link.customSlug) {
        const existing = await prisma.link.findFirst({
          where: { OR: [{ shortCode: link.customSlug }, { customSlug: link.customSlug }] },
        })
        if (existing) {
          results.push({ index: i, success: false, error: "Slug already taken" })
          continue
        }
        shortCode = link.customSlug
      } else {
        shortCode = generateShortCode()
      }

      const created = await prisma.link.create({
        data: {
          shortCode,
          customSlug: link.customSlug || null,
          originalUrl: url,
          title: link.title?.slice(0, 500) || null,
          userId: user.id,
        },
      })

      results.push({
        index: i,
        success: true,
        shortUrl: `${appUrl}/${created.customSlug || created.shortCode}`,
        shortCode: created.customSlug || created.shortCode,
      })
    } catch {
      results.push({ index: i, success: false, error: "Failed to create link" })
    }
  }

  const successCount = results.filter((r) => r.success).length

  logAudit({
    userId: user.id,
    action: "link.bulk_create",
    resource: "link",
    metadata: {
      total: body.links.length,
      succeeded: successCount,
      failed: body.links.length - successCount,
    },
  })

  return NextResponse.json({
    total: body.links.length,
    succeeded: successCount,
    failed: body.links.length - successCount,
    results,
  })
}
