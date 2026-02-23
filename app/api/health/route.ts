import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const startTime = Date.now()

export async function GET() {
  const checks: Record<string, string> = {}

  // Check DB connectivity
  try {
    await prisma.$queryRawUnsafe("SELECT 1")
    checks.database = "healthy"
  } catch {
    checks.database = "unhealthy"
  }

  const allHealthy = Object.values(checks).every((v) => v === "healthy")

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  )
}
