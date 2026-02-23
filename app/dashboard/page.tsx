import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LinkCard } from "@/components/link-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Search, Link2, BarChart3, MousePointerClick, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1"))
  const search = params.search || ""
  const sort = params.sort || "newest"
  const perPage = 20

  const where = {
    userId: session.user.id,
    ...(search
      ? {
          OR: [
            { originalUrl: { contains: search, mode: "insensitive" as const } },
            { customSlug: { contains: search, mode: "insensitive" as const } },
            { shortCode: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : sort === "clicks"
        ? { clicks: { _count: "desc" as const } }
        : { createdAt: "desc" as const }

  const [links, total, totalClicks] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: { select: { clicks: true } },
      },
    }),
    prisma.link.count({ where }),
    prisma.click.count({
      where: { link: { userId: session.user.id } },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total Links</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
              <MousePointerClick className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
              <BarChart3 className="h-4 w-4 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold">
                {total > 0 ? (totalClicks / total).toFixed(1) : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Clicks/Link</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your shortened links
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <form className="flex-1" action="/dashboard">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search links..."
              defaultValue={search}
              className="pl-9"
            />
          </div>
        </form>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "clicks", label: "Top Clicks" },
          ].map((s) => (
            <Button
              key={s.value}
              variant={sort === s.value ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              asChild
            >
              <Link
                href={`/dashboard?sort=${s.value}${search ? `&search=${search}` : ""}`}
              >
                {s.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-1">
            {search ? "No links match your search" : "No links yet"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {search
              ? "Try a different search term or clear the filter."
              : "Create your first short link and start tracking clicks, devices, and locations."}
          </p>
          {!search && (
            <Button asChild>
              <Link href="/">
                Create your first link
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              clickCount={link._count.clicks}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard?page=${page - 1}${sort !== "newest" ? `&sort=${sort}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard?page=${page + 1}${sort !== "newest" ? `&sort=${sort}` : ""}${search ? `&search=${search}` : ""}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
