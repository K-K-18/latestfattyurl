import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const domains = await prisma.customDomain.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ domains })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  let body: { domain?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.domain || typeof body.domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 })
  }

  const domain = body.domain.toLowerCase().trim()

  // Basic domain validation
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
  }

  if (domain.includes("fattyurl.com")) {
    return NextResponse.json({ error: "Cannot use fattyurl.com subdomain" }, { status: 400 })
  }

  const existing = await prisma.customDomain.findUnique({ where: { domain } })
  if (existing) {
    return NextResponse.json({ error: "Domain already registered" }, { status: 409 })
  }

  // Generate a TXT record verification token
  const txtRecord = `fattyurl-verify-${randomBytes(16).toString("hex")}`

  const newDomain = await prisma.customDomain.create({
    data: {
      domain,
      userId: user.id,
      txtRecord,
    },
  })

  logAudit({
    userId: user.id,
    action: "domain.add",
    resource: "domain",
    resourceId: newDomain.id,
    metadata: { domain },
  })

  return NextResponse.json(
    {
      id: newDomain.id,
      domain: newDomain.domain,
      verified: false,
      txtRecord,
      instructions: `Add a TXT record with value "${txtRecord}" to your DNS for ${domain}, then call the verify endpoint.`,
    },
    { status: 201 }
  )
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: "Domain id is required" }, { status: 400 })
  }

  const domain = await prisma.customDomain.findFirst({
    where: { id: body.id, userId: user.id },
  })
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 })
  }

  await prisma.customDomain.delete({ where: { id: body.id } })

  logAudit({
    userId: user.id,
    action: "domain.remove",
    resource: "domain",
    resourceId: body.id,
    metadata: { domain: domain.domain },
  })

  return NextResponse.json({ success: true })
}
