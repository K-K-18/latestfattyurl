import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Plus, Crown, Shield, User } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team | FattyURL",
  robots: { index: false },
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
}

export default async function TeamPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
            orderBy: { joinedAt: "asc" },
          },
          _count: { select: { links: true } },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team workspaces and members
          </p>
        </div>
      </div>

      {memberships.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No teams yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Create a team to collaborate on links with your colleagues.
              Use the API to create a team:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                POST /api/v1/teams
              </code>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {memberships.map(({ team, role }) => {
            const RoleIcon = roleIcons[role as keyof typeof roleIcons] || User
            return (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>
                        /{team.slug} &middot; {team._count.links} links &middot;{" "}
                        {team.members.length} members
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-full px-2.5 py-1">
                      <RoleIcon className="h-3 w-3" />
                      {role}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-sm font-medium mb-3">Members</h3>
                  <div className="space-y-2">
                    {team.members.map((member) => {
                      const MemberIcon = roleIcons[member.role as keyof typeof roleIcons] || User
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between text-sm py-1.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {member.user.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.user.name || "Unnamed"}
                                {member.user.id === session.user?.id && (
                                  <span className="text-muted-foreground ml-1">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MemberIcon className="h-3 w-3" />
                            {member.role}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
