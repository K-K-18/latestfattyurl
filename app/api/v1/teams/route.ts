import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          _count: { select: { members: true, links: true } },
        },
      },
    },
  })

  return NextResponse.json({
    teams: memberships.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      slug: m.team.slug,
      role: m.role,
      members: m.team._count.members,
      links: m.team._count.links,
      joinedAt: m.joinedAt,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  let body: { name?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.name || body.name.length < 2 || body.name.length > 100) {
    return NextResponse.json({ error: "Team name must be 2-100 characters" }, { status: 400 })
  }

  const slug = (body.slug || body.name)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)

  const existing = await prisma.team.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: "Team slug already taken" }, { status: 409 })
  }

  const team = await prisma.team.create({
    data: {
      name: body.name,
      slug,
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  })

  logAudit({
    userId: user.id,
    action: "team.create",
    resource: "team",
    resourceId: team.id,
    metadata: { name: team.name, slug: team.slug },
  })

  return NextResponse.json(
    { id: team.id, name: team.name, slug: team.slug },
    { status: 201 }
  )
}
