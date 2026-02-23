"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Tag } from "lucide-react"

interface UtmBuilderProps {
  onUtmChange: (params: string) => void
}

export function UtmBuilder({ onUtmChange }: UtmBuilderProps) {
  const [open, setOpen] = useState(false)
  const [utm, setUtm] = useState({
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  })

  function handleChange(field: string, value: string) {
    const updated = { ...utm, [field]: value }
    setUtm(updated)

    // Build query string from non-empty fields
    const params = new URLSearchParams()
    if (updated.source) params.set("utm_source", updated.source)
    if (updated.medium) params.set("utm_medium", updated.medium)
    if (updated.campaign) params.set("utm_campaign", updated.campaign)
    if (updated.term) params.set("utm_term", updated.term)
    if (updated.content) params.set("utm_content", updated.content)

    onUtmChange(params.toString())
  }

  function handleClear() {
    setUtm({ source: "", medium: "", campaign: "", term: "", content: "" })
    onUtmChange("")
  }

  const hasValues = Object.values(utm).some((v) => v.trim() !== "")

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Tag className="h-3.5 w-3.5" />
        UTM Parameters
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {hasValues && (
          <span className="ml-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">
            Active
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-lg border p-4 bg-muted/30">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="utm-source" className="text-xs">
                Source <span className="text-muted-foreground">(e.g. google, newsletter)</span>
              </Label>
              <Input
                id="utm-source"
                placeholder="google"
                value={utm.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utm-medium" className="text-xs">
                Medium <span className="text-muted-foreground">(e.g. cpc, email, social)</span>
              </Label>
              <Input
                id="utm-medium"
                placeholder="cpc"
                value={utm.medium}
                onChange={(e) => handleChange("medium", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utm-campaign" className="text-xs">
                Campaign <span className="text-muted-foreground">(e.g. spring_sale)</span>
              </Label>
              <Input
                id="utm-campaign"
                placeholder="spring_sale"
                value={utm.campaign}
                onChange={(e) => handleChange("campaign", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utm-term" className="text-xs">
                Term <span className="text-muted-foreground">(optional, paid search keyword)</span>
              </Label>
              <Input
                id="utm-term"
                placeholder="url+shortener"
                value={utm.term}
                onChange={(e) => handleChange("term", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="utm-content" className="text-xs">
                Content <span className="text-muted-foreground">(optional, A/B test variant)</span>
              </Label>
              <Input
                id="utm-content"
                placeholder="header_cta"
                value={utm.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {hasValues && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                UTM parameters will be appended to your URL
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
