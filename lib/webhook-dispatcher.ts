import { prisma } from "@/lib/db"
import { createHmac } from "crypto"
import { logger } from "@/lib/logger"

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
}

/**
 * Dispatch a webhook event to all active subscribers.
 * Fire-and-forget with 3 retries and exponential backoff.
 */
export async function dispatchWebhookEvent(
  event: string,
  data: Record<string, unknown>,
  userId?: string | null
) {
  // Find all active webhooks subscribed to this event
  const where = {
    isActive: true,
    events: { has: event },
    ...(userId ? { userId } : {}),
  }

  const webhooks = await prisma.webhook.findMany({ where })

  for (const webhook of webhooks) {
    deliverWithRetry(webhook.url, webhook.secret, event, data)
  }
}

async function deliverWithRetry(
  url: string,
  secret: string,
  event: string,
  data: Record<string, unknown>,
  attempt = 1
) {
  const maxRetries = 3
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  }

  const body = JSON.stringify(payload)
  const signature = createHmac("sha256", secret).update(body).digest("hex")

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": event,
        "User-Agent": "FattyURL-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!response.ok && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000 // Exponential: 2s, 4s, 8s
      logger.warn("Webhook delivery failed, retrying", {
        url,
        event,
        status: response.status,
        attempt,
        nextRetryMs: delay,
      })
      setTimeout(() => deliverWithRetry(url, secret, event, data, attempt + 1), delay)
    } else if (!response.ok) {
      logger.error("Webhook delivery failed after all retries", {
        url,
        event,
        status: response.status,
      })
    }
  } catch (err) {
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000
      setTimeout(() => deliverWithRetry(url, secret, event, data, attempt + 1), delay)
    } else {
      logger.error("Webhook delivery error after all retries", {
        url,
        event,
        error: err instanceof Error ? err.message : "Unknown",
      })
    }
  }
}
