import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedUser } from "@/lib/api-auth"
import { logAudit } from "@/lib/audit"
import dns from "dns/promises"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const domain = await prisma.customDomain.findFirst({
    where: { id, userId: user.id },
  })

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 })
  }

  if (domain.verified) {
    return NextResponse.json({ verified: true, message: "Domain already verified" })
  }

  if (!domain.txtRecord) {
    return NextResponse.json({ error: "No verification token found" }, { status: 400 })
  }

  // Check DNS TXT records
  try {
    const records = await dns.resolveTxt(domain.domain)
    const flatRecords = records.map((r) => r.join(""))
    const found = flatRecords.includes(domain.txtRecord)

    if (found) {
      await prisma.customDomain.update({
        where: { id },
        data: { verified: true },
      })

      logAudit({
        userId: user.id,
        action: "domain.verify",
        resource: "domain",
        resourceId: id,
        metadata: { domain: domain.domain },
      })

      return NextResponse.json({
        verified: true,
        message: "Domain verified successfully!",
      })
    }

    return NextResponse.json({
      verified: false,
      message: `TXT record not found. Expected: ${domain.txtRecord}`,
      found: flatRecords,
    })
  } catch (err) {
    return NextResponse.json({
      verified: false,
      message: "DNS lookup failed. Make sure the TXT record is set and has propagated.",
      error: err instanceof Error ? err.message : "DNS error",
    })
  }
}
