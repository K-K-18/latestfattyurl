"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Link2, Copy, Check, ChevronDown, ChevronUp, QrCode, Loader2 } from "lucide-react"
import { shortenUrl, type ShortenResult } from "@/app/actions"
import { QrPreview } from "@/components/qr-preview"
import { UtmBuilder } from "@/components/utm-builder"

export function ShortenerForm() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [utmParams, setUtmParams] = useState("")
  const urlInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      // Append UTM params to URL if set
      if (utmParams) {
        const rawUrl = formData.get("url") as string
        if (rawUrl) {
          try {
            const url = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`)
            const utmSearch = new URLSearchParams(utmParams)
            utmSearch.forEach((value, key) => {
              url.searchParams.set(key, value)
            })
            formData.set("url", url.toString())
          } catch {
            // If URL parsing fails, just submit as-is
          }
        }
      }

      const res = await shortenUrl(formData)
      setResult(res)
      if (res.success) {
        toast.success("Link shortened!")
      } else {
        toast.error(res.error || "Something went wrong")
      }
    })
  }

  function handleCopy() {
    if (result?.shortUrl) {
      navigator.clipboard.writeText(result.shortUrl)
      setCopied(true)
      toast.success("Copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <form action={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={urlInputRef}
              name="url"
              type="text"
              placeholder="Paste your long URL here..."
              className="h-14 pl-11 text-lg"
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 text-lg font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Shorten"
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCustom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Custom slug
          </button>

          <UtmBuilder onUtmChange={setUtmParams} />
        </div>

        {showCustom && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              fattyurl.com/
            </span>
            <Input
              name="customSlug"
              type="text"
              placeholder="my-custom-slug"
              className="h-10"
              pattern="[a-zA-Z0-9-]+"
              minLength={3}
              maxLength={50}
            />
          </div>
        )}
      </form>

      {result?.success && result.shortUrl && (
        <Card className="p-4 space-y-3 border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Your shortened URL</p>
              <p className="text-lg font-semibold truncate text-green-600 dark:text-green-400">
                {result.shortUrl}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
              aria-label="Copy short URL"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQr(!showQr)}
              className="shrink-0"
              aria-label="Show QR code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>

          {showQr && result.shortUrl && (
            <QrPreview url={result.shortUrl} compact />
          )}
        </Card>
      )}
    </div>
  )
}
