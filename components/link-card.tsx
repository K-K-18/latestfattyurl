"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Copy,
  Check,
  BarChart3,
  ExternalLink,
  Pencil,
  MousePointerClick,
} from "lucide-react"
import type { Link as LinkType } from "@/lib/generated/prisma/client"

interface LinkCardProps {
  link: LinkType
  clickCount: number
}

export function LinkCard({ link, clickCount }: LinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [isActive, setIsActive] = useState(link.isActive)
  const [isToggling, setIsToggling] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${appUrl}/${link.customSlug || link.shortCode}`

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggle(checked: boolean) {
    // Prevent race conditions — abort any in-flight toggle
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    const previousState = isActive
    setIsActive(checked)
    setIsToggling(true)

    try {
      const res = await fetch(`/api/v1/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error()
      toast.success(checked ? "Link activated" : "Link deactivated")
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setIsActive(previousState)
      toast.error("Failed to update link")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className="p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      {/* Mobile layout: stacked */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/links/${link.id}`}
              className="text-sm font-semibold text-primary truncate hover:underline"
            >
              {shortUrl.replace(/^https?:\/\//, "")}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleCopy}
              aria-label="Copy short URL"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground truncate block hover:underline max-w-full sm:max-w-md"
          >
            {link.originalUrl}
            <ExternalLink className="inline ml-1 h-3 w-3" />
          </a>
          {link.title && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{link.title}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Badge variant="secondary" className="font-mono text-xs">
            <MousePointerClick className="mr-1 h-3 w-3" />
            {clickCount}
          </Badge>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(link.createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-1 ml-auto sm:ml-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/dashboard/links/${link.id}`} title="Edit link">
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/dashboard/links/${link.id}/analytics`} title="View analytics">
                <BarChart3 className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              aria-label={isActive ? "Deactivate link" : "Activate link"}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
