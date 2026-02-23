"use server"

import { prisma } from "@/lib/db"
import { generateShortCode } from "@/lib/utils/short-code"
import { validateUrl, sanitizeUrl } from "@/lib/utils/url-validator"
import { auth } from "@/lib/auth"
import {
  RESERVED_SLUGS,
  SLUG_MIN_LENGTH,
  SLUG_MAX_LENGTH,
  SLUG_REGEX,
} from "@/lib/constants"

export type ShortenResult = {
  success: boolean
  shortUrl?: string
  shortCode?: string
  error?: string
}

export async function shortenUrl(
  formData: FormData
): Promise<ShortenResult> {
  const rawUrl = formData.get("url") as string
  const customSlug = (formData.get("customSlug") as string)?.trim() || null

  if (!rawUrl) {
    return { success: false, error: "Please enter a URL" }
  }

  const url = sanitizeUrl(rawUrl)
  const validation = validateUrl(url)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Validate custom slug if provided
  if (customSlug) {
    if (customSlug.length < SLUG_MIN_LENGTH || customSlug.length > SLUG_MAX_LENGTH) {
      return {
        success: false,
        error: `Custom slug must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`,
      }
    }
    if (!SLUG_REGEX.test(customSlug)) {
      return {
        success: false,
        error: "Custom slug can only contain letters, numbers, and hyphens",
      }
    }
    if (RESERVED_SLUGS.includes(customSlug.toLowerCase())) {
      return { success: false, error: "This slug is reserved" }
    }

    // Check if slug already taken
    const existing = await prisma.link.findFirst({
      where: {
        OR: [{ shortCode: customSlug }, { customSlug }],
      },
    })
    if (existing) {
      return { success: false, error: "This slug is already taken" }
    }
  }

  const session = await auth()
  const userId = session?.user?.id || null

  const shortCode = customSlug || generateShortCode()

  try {
    await prisma.link.create({
      data: {
        shortCode,
        customSlug: customSlug || null,
        originalUrl: url,
        userId,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const shortUrl = `${appUrl}/${customSlug || shortCode}`

    return { success: true, shortUrl, shortCode: customSlug || shortCode }
  } catch {
    return { success: false, error: "Failed to create short link. Please try again." }
  }
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  if (!slug || slug.length < SLUG_MIN_LENGTH) return false
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false
  if (!SLUG_REGEX.test(slug)) return false

  const existing = await prisma.link.findFirst({
    where: {
      OR: [{ shortCode: slug }, { customSlug: slug }],
    },
  })

  return !existing
}

export async function getLinkStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalLinks, linksToday] = await Promise.all([
    prisma.link.count(),
    prisma.link.count({
      where: { createdAt: { gte: today } },
    }),
  ])

  return { totalLinks, linksToday }
}

// --- Bitly Migration Server Actions ---
// These run server-side to avoid CORS issues and token exposure in the browser

type BitlyLink = {
  long_url: string
  link: string
  custom_bitlinks?: string[]
  title?: string
}

export async function fetchBitlyLinks(
  token: string
): Promise<{ success: boolean; links?: BitlyLink[]; error?: string }> {
  if (!token || token.trim().length < 10) {
    return { success: false, error: "Please enter a valid Bitly API token" }
  }

  try {
    // Get the default group
    const groupRes = await fetch("https://api-ssl.bitly.com/v4/groups", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!groupRes.ok) {
      return { success: false, error: "Invalid Bitly token" }
    }

    const groupData = await groupRes.json()
    const groupGuid = groupData.groups?.[0]?.guid
    if (!groupGuid) {
      return { success: false, error: "No Bitly group found" }
    }

    // Fetch bitlinks
    const linksRes = await fetch(
      `https://api-ssl.bitly.com/v4/groups/${groupGuid}/bitlinks?size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!linksRes.ok) {
      return { success: false, error: "Failed to fetch Bitly links" }
    }

    const linksData = await linksRes.json()
    return { success: true, links: linksData.links || [] }
  } catch {
    return { success: false, error: "Failed to connect to Bitly" }
  }
}

export async function importBitlyLink(
  longUrl: string,
  customSlug?: string
): Promise<{ status: "imported" | "conflict" | "error" }> {
  const session = await auth()
  const userId = session?.user?.id || null

  const url = sanitizeUrl(longUrl)
  const validation = validateUrl(url)
  if (!validation.valid) {
    return { status: "error" }
  }

  try {
    if (customSlug) {
      // Check if slug is available
      const existing = await prisma.link.findFirst({
        where: { OR: [{ shortCode: customSlug }, { customSlug }] },
      })

      if (existing) {
        // Try without custom slug
        const shortCode = generateShortCode()
        await prisma.link.create({
          data: {
            shortCode,
            originalUrl: url,
            userId,
          },
        })
        return { status: "conflict" }
      }

      await prisma.link.create({
        data: {
          shortCode: customSlug,
          customSlug,
          originalUrl: url,
          userId,
        },
      })
      return { status: "imported" }
    }

    // No custom slug
    const shortCode = generateShortCode()
    await prisma.link.create({
      data: {
        shortCode,
        originalUrl: url,
        userId,
      },
    })
    return { status: "imported" }
  } catch {
    return { status: "error" }
  }
}
