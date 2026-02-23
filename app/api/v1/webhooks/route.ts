import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"
import { createHmac, randomBytes } from "crypto"

const VALID_EVENTS = ["click", "link.created", "link.deleted", "link.updated"]

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const webhooks = await prisma.webhook.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      events: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ webhooks })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  let body: { url?: string; events?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    new URL(body.url)
  } catch {
    return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
  }

  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json(
      { error: `Events required. Valid: ${VALID_EVENTS.join(", ")}` },
      { status: 400 }
    )
  }

  const invalidEvents = body.events.filter((e) => !VALID_EVENTS.includes(e))
  if (invalidEvents.length > 0) {
    return NextResponse.json(
      { error: `Invalid events: ${invalidEvents.join(", ")}` },
      { status: 400 }
    )
  }

  // Generate HMAC secret for this webhook
  const secret = randomBytes(32).toString("hex")

  const webhook = await prisma.webhook.create({
    data: {
      userId: user.id,
      url: body.url,
      events: body.events,
      secret,
    },
  })

  logAudit({
    userId: user.id,
    action: "webhook.create",
    resource: "webhook",
    resourceId: webhook.id,
    metadata: { url: body.url, events: body.events },
  })

  return NextResponse.json(
    {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret, // Show once on creation
      message: "Save this secret. It will not be shown again.",
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
    return NextResponse.json({ error: "Webhook id is required" }, { status: 400 })
  }

  const webhook = await prisma.webhook.findFirst({
    where: { id: body.id, userId: user.id },
  })
  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
  }

  await prisma.webhook.delete({ where: { id: body.id } })

  logAudit({
    userId: user.id,
    action: "webhook.delete",
    resource: "webhook",
    resourceId: body.id,
  })

  return NextResponse.json({ success: true })
}
