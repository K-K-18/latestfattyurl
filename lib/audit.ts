import { prisma } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"

interface AuditEntry {
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ip?: string
}

/**
 * Log an audit event. Fire-and-forget — never blocks the main request.
 */
export function logAudit(entry: AuditEntry) {
  prisma.auditLog
    .create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        metadata: entry.metadata
          ? (entry.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip: entry.ip || null,
      },
    })
    .catch(() => {}) // Non-critical — don't let audit failures break the app
}
