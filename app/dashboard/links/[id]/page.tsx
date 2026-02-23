import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, ExternalLink, Copy, QrCode } from "lucide-react"
import Link from "next/link"
import { LinkEditor } from "@/components/link-editor"
import { QrPreview } from "@/components/qr-preview"

export const metadata = {
  title: "Link Details",
}

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const link = await prisma.link.findUnique({
    where: { id, userId: session.user.id },
    include: {
      _count: { select: { clicks: true } },
    },
  })

  if (!link) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${appUrl}/${link.customSlug || link.shortCode}`

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">
            {link.title || shortUrl.replace(/^https?:\/\//, "")}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={link.isActive ? "default" : "secondary"}>
              {link.isActive ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(link.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/links/${id}/analytics`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </Button>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Short URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-primary truncate">
              {shortUrl.replace(/^https?:\/\//, "")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{link._count.clicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate block"
            >
              {link.originalUrl}
              <ExternalLink className="inline ml-1 h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Link</CardTitle>
          <CardDescription>Update your link settings</CardDescription>
        </CardHeader>
        <CardContent>
          <LinkEditor
            linkId={link.id}
            initialData={{
              originalUrl: link.originalUrl,
              title: link.title || "",
              customSlug: link.customSlug || "",
              isActive: link.isActive,
              expiresAt: link.expiresAt?.toISOString().split("T")[0] || "",
            }}
          />
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code
          </CardTitle>
          <CardDescription>Download QR code for this link</CardDescription>
        </CardHeader>
        <CardContent>
          <QrPreview url={shortUrl} />
        </CardContent>
      </Card>
    </div>
  )
}
