import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MousePointerClick, Users, Globe, Monitor } from "lucide-react"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"

export const metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ period?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const { period = "30d" } = await searchParams

  const link = await prisma.link.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!link) notFound()

  // Calculate date range
  const now = new Date()
  const periodDays =
    period === "7d" ? 7 : period === "90d" ? 90 : period === "all" ? 3650 : 30
  const fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

  const clickWhere = {
    linkId: id,
    clickedAt: { gte: fromDate },
  }

  // Run all queries in parallel
  const [
    totalClicks,
    uniqueVisitors,
    clicksByDate,
    topCountries,
    deviceBreakdown,
    browserBreakdown,
    topReferrers,
  ] = await Promise.all([
    prisma.click.count({ where: clickWhere }),
    prisma.click.groupBy({
      by: ["ipHash"],
      where: clickWhere,
    }),
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("clickedAt") as date, COUNT(*) as count
      FROM "Click"
      WHERE "linkId" = ${id} AND "clickedAt" >= ${fromDate}
      GROUP BY DATE("clickedAt")
      ORDER BY date ASC
    `,
    prisma.click.groupBy({
      by: ["country"],
      where: clickWhere,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.click.groupBy({
      by: ["deviceType"],
      where: clickWhere,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.click.groupBy({
      by: ["browser"],
      where: clickWhere,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.click.groupBy({
      by: ["referrer"],
      where: clickWhere,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${appUrl}/${link.customSlug || link.shortCode}`

  // Serialize data for client components
  const chartData = {
    clicksByDate: clicksByDate.map((d) => ({
      date: d.date.toString().split("T")[0],
      count: Number(d.count),
    })),
    topCountries: topCountries.map((c) => ({
      country: c.country || "Unknown",
      count: c._count.id,
    })),
    deviceBreakdown: deviceBreakdown.map((d) => ({
      device: d.deviceType || "Unknown",
      count: d._count.id,
    })),
    browserBreakdown: browserBreakdown.map((b) => ({
      browser: b.browser || "Unknown",
      count: b._count.id,
    })),
    topReferrers: topReferrers.map((r) => ({
      referrer: r.referrer || "Direct",
      count: r._count.id,
    })),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">{shortUrl}</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1">
        {["7d", "30d", "90d", "all"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/dashboard/links/${id}/analytics?period=${p}`}>
              {p === "all" ? "All time" : p}
            </Link>
          </Button>
        ))}
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueVisitors.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.topCountries[0]?.country || "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Device</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {chartData.deviceBreakdown[0]?.device || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts data={chartData} />
    </div>
  )
}
