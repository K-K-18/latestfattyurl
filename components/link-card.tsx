"use client"

import { useState } from "react"
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
} from "lucide-react"
import type { Link as LinkType } from "@/lib/generated/prisma/client"

interface LinkCardProps {
  link: LinkType
  clickCount: number
}

export function LinkCard({ link, clickCount }: LinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [isActive, setIsActive] = useState(link.isActive)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${appUrl}/${link.customSlug || link.shortCode}`

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("Copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggle(checked: boolean) {
    setIsActive(checked)
    try {
      const res = await fetch(`/api/v1/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      })
      if (!res.ok) throw new Error()
      toast.success(checked ? "Link activated" : "Link deactivated")
    } catch {
      setIsActive(!checked)
      toast.error("Failed to update link")
    }
  }

  return (
    <Card className="p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/links/${link.id}`}
              className="text-sm font-semibold text-primary truncate hover:underline"
            >
              {shortUrl.replace(/^https?:\/\//, "")}
            </Link>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
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
            className="text-sm text-muted-foreground truncate block hover:underline max-w-md"
          >
            {link.originalUrl}
            <ExternalLink className="inline ml-1 h-3 w-3" />
          </a>
          {link.title && (
            <p className="text-xs text-muted-foreground mt-1">{link.title}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="font-mono">
            <BarChart3 className="mr-1 h-3 w-3" />
            {clickCount}
          </Badge>

          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/dashboard/links/${link.id}`} title="Edit">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/dashboard/links/${link.id}/analytics`} title="Analytics">
              <BarChart3 className="h-4 w-4" />
            </Link>
          </Button>

          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
          />

          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
            {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  )
}
