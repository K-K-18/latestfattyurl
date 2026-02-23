"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, Check, AlertCircle } from "lucide-react"
import { fetchBitlyLinks, importBitlyLink } from "@/app/actions"

type BitlyLink = {
  long_url: string
  link: string
  custom_bitlinks?: string[]
  title?: string
}

type ImportResult = {
  imported: number
  conflicts: number
  errors: number
}

export function MigrationWizard() {
  const [step, setStep] = useState(1)
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [links, setLinks] = useState<BitlyLink[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleFetchLinks() {
    if (!token.trim()) {
      toast.error("Please enter your Bitly API token")
      return
    }

    setLoading(true)
    try {
      // Call server action instead of direct Bitly API (fixes CORS + token exposure)
      const res = await fetchBitlyLinks(token)

      if (!res.success) {
        toast.error(res.error || "Failed to connect to Bitly")
        setLoading(false)
        return
      }

      setLinks(res.links || [])
      setStep(2)
      toast.success(`Found ${res.links?.length || 0} links`)
    } catch {
      toast.error("Failed to connect to Bitly")
    }
    setLoading(false)
  }

  async function importLinks() {
    setLoading(true)
    let imported = 0
    let conflicts = 0
    let errors = 0

    for (const bitlyLink of links) {
      try {
        // Extract custom slug from Bitly URL
        const bitlyUrl = new URL(bitlyLink.link)
        const slug = bitlyUrl.pathname.slice(1)

        // Call server action instead of direct API fetch
        const res = await importBitlyLink(bitlyLink.long_url, slug)

        if (res.status === "imported") {
          imported++
        } else if (res.status === "conflict") {
          conflicts++
          imported++ // Still imported, just with a different slug
        } else {
          errors++
        }
      } catch {
        errors++
      }
    }

    setResult({ imported, conflicts, errors })
    setStep(3)
    setLoading(false)
    toast.success(`Imported ${imported} links!`)
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-4" role="navigation" aria-label="Migration steps">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-current={s === step ? "step" : undefined}
              aria-label={`Step ${s}: ${s === 1 ? "Connect" : s === 2 ? "Review" : "Done"}`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className="text-sm text-muted-foreground">
              {s === 1 ? "Connect" : s === 2 ? "Review" : "Done"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Enter token */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect your Bitly account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your Bitly API access token. You can find it at{" "}
              <span className="font-mono text-xs">
                Bitly Settings &rarr; Developer settings &rarr; API
              </span>
            </p>
            <Input
              placeholder="Your Bitly API token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type="password"
              aria-label="Bitly API token"
            />
            <Button onClick={handleFetchLinks} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch my links
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review links to import ({links.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b">
                  <span className="truncate max-w-xs">{link.long_url}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {new URL(link.link).pathname.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={importLinks} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import all {links.length} links
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <Card>
          <CardHeader>
            <CardTitle>Migration complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" role="status">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>{result.imported} links imported successfully</span>
            </div>
            {result.conflicts > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>{result.conflicts} had slug conflicts (imported with new codes)</span>
              </div>
            )}
            {result.errors > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{result.errors} failed to import</span>
              </div>
            )}
            <Button asChild className="mt-4">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CSV Upload option */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Or upload a CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Export your links from Bitly as CSV and upload here. The CSV should
              have columns for the original URL and custom slug.
            </p>
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              CSV Upload (coming soon)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
