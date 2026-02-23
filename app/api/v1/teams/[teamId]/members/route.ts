import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"

async function requireTeamAdmin(userId: string, teamId: string) {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return null
  }
  return membership
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { teamId } = await params

  // Must be a team member to see members
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  })
  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 })
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { joinedAt: "asc" },
  })

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(user.id, "authenticated")
  if (!allowed) return rateLimitResponse(resetMs)

  const { teamId } = await params

  const adminCheck = await requireTeamAdmin(user.id, teamId)
  if (!adminCheck) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: { email?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const invitedUser = await prisma.user.findUnique({
    where: { email: body.email },
  })
  if (!invitedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: invitedUser.id } },
  })
  if (existingMember) {
    return NextResponse.json({ error: "User is already a team member" }, { status: 409 })
  }

  const role = body.role === "admin" ? "admin" : "member"

  const member = await prisma.teamMember.create({
    data: {
      teamId,
      userId: invitedUser.id,
      role,
    },
  })

  logAudit({
    userId: user.id,
    action: "team.member.add",
    resource: "team_member",
    resourceId: member.id,
    metadata: { teamId, invitedEmail: body.email, role },
  })

  return NextResponse.json(
    { id: member.id, role: member.role },
    { status: 201 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { teamId } = await params

  const adminCheck = await requireTeamAdmin(user.id, teamId)
  if (!adminCheck) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: { userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  // Can't remove the owner
  const targetMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: body.userId } },
  })
  if (!targetMember) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }
  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 })
  }

  await prisma.teamMember.delete({
    where: { id: targetMember.id },
  })

  logAudit({
    userId: user.id,
    action: "team.member.remove",
    resource: "team_member",
    resourceId: targetMember.id,
    metadata: { teamId, removedUserId: body.userId },
  })

  return NextResponse.json({ success: true })
}
