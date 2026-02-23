import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const csvHeader = "Short URL,Original URL,Title,Clicks,Active,Created At\n"
  const csvRows = links
    .map((l) => {
      const shortUrl = `${appUrl}/${l.customSlug || l.shortCode}`
      return [
        shortUrl,
        `"${l.originalUrl.replace(/"/g, '""')}"`,
        `"${(l.title || "").replace(/"/g, '""')}"`,
        l._count.clicks,
        l.isActive,
        l.createdAt.toISOString(),
      ].join(",")
    })
    .join("\n")

  return new NextResponse(csvHeader + csvRows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="fattyurl-export.csv"`,
    },
  })
}
