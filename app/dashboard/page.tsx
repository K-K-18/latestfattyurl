import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LinkCard } from "@/components/link-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
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

  const [links, total] = await Promise.all([
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
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Links</h1>
          <p className="text-sm text-muted-foreground">
            {total} link{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2">
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
        <div className="flex gap-1">
          {[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "clicks", label: "Most clicked" },
          ].map((s) => (
            <Button
              key={s.value}
              variant={sort === s.value ? "default" : "outline"}
              size="sm"
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No links yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first short link to get started
          </p>
          <Button className="mt-4" asChild>
            <Link href="/">Create your first link</Link>
          </Button>
        </div>
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
          <span className="text-sm text-muted-foreground">
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
