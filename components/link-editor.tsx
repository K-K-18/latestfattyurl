"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface LinkEditorProps {
  linkId: string
  initialData: {
    originalUrl: string
    title: string
    customSlug: string
    isActive: boolean
    expiresAt: string
  }
}

export function LinkEditor({ linkId, initialData }: LinkEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(initialData)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: data.originalUrl,
          title: data.title || null,
          customSlug: data.customSlug || null,
          isActive: data.isActive,
          expiresAt: data.expiresAt || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }

      toast.success("Link updated successfully")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update link")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="My awesome link"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="originalUrl">Destination URL</Label>
        <Input
          id="originalUrl"
          value={data.originalUrl}
          onChange={(e) => setData({ ...data, originalUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customSlug">Custom Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            fattyurl.com/
          </span>
          <Input
            id="customSlug"
            value={data.customSlug}
            onChange={(e) => setData({ ...data, customSlug: e.target.value })}
            placeholder="my-slug"
            pattern="[a-zA-Z0-9-]+"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
        <Input
          id="expiresAt"
          type="date"
          value={data.expiresAt}
          onChange={(e) => setData({ ...data, expiresAt: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label>Active</Label>
          <p className="text-sm text-muted-foreground">
            Inactive links will show a 404 page
          </p>
        </div>
        <Switch
          checked={data.isActive}
          onCheckedChange={(checked) => setData({ ...data, isActive: checked })}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Changes
      </Button>
    </div>
  )
}
