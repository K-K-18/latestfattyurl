"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, Check, AlertCircle, ArrowRight, Shield, Sparkles } from "lucide-react"
import { fetchProviderLinks, importProviderLink } from "@/app/actions"

type ProviderLink = {
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
  const [links, setLinks] = useState<ProviderLink[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleFetchLinks() {
    if (!token.trim()) {
      toast.error("Please enter your API token")
      return
    }

    setLoading(true)
    try {
      const res = await fetchProviderLinks(token)

      if (!res.success) {
        toast.error(res.error || "Failed to connect to provider")
        setLoading(false)
        return
      }

      setLinks(res.links || [])
      setStep(2)
      toast.success(`Found ${res.links?.length || 0} links`)
    } catch {
      toast.error("Failed to connect to provider")
    }
    setLoading(false)
  }

  async function importLinks() {
    setLoading(true)
    let imported = 0
    let conflicts = 0
    let errors = 0

    for (const providerLink of links) {
      try {
        const providerUrl = new URL(providerLink.link)
        const slug = providerUrl.pathname.slice(1)

        const res = await importProviderLink(providerLink.long_url, slug)

        if (res.status === "imported") {
          imported++
        } else if (res.status === "conflict") {
          conflicts++
          imported++
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
      <div className="flex items-center gap-2 sm:gap-4" role="navigation" aria-label="Migration steps">
        {[
          { num: 1, label: "Connect" },
          { num: 2, label: "Review" },
          { num: 3, label: "Done" },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                s.num < step
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                  : s.num === step
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-current={s.num === step ? "step" : undefined}
              aria-label={`Step ${s.num}: ${s.label}`}
            >
              {s.num < step ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-sm hidden sm:inline ${s.num === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {idx < 2 && <div className="w-6 sm:w-12 h-0.5 bg-border rounded-full" />}
          </div>
        ))}
      </div>

      {/* Step 1: Enter token */}
      {step === 1 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Connect your link provider
            </CardTitle>
            <CardDescription>
              Currently supports migration from popular URL shortening services.
              Your token is processed server-side and never stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How to get your API token:</p>
              <p>
                Go to your provider&apos;s Settings &rarr; Developer Settings &rarr; API
                to generate an access token.
              </p>
            </div>
            <Input
              placeholder="Paste your API access token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type="password"
              aria-label="Provider API token"
              className="h-12"
            />
            <Button onClick={handleFetchLinks} disabled={loading} size="lg" className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Fetch my links
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Review links to import ({links.length})
            </CardTitle>
            <CardDescription>
              These links will be imported to your FattyURL account. Custom slugs will be preserved when available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-72 overflow-y-auto space-y-1 rounded-lg border bg-muted/20 p-2">
              {links.map((link, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="truncate max-w-[60%] text-foreground">{link.long_url}</span>
                  <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {new URL(link.link).pathname.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={importLinks} disabled={loading} size="lg">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Import all {links.length} links
              </Button>
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <Card className="border-2 border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              Migration complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" role="status">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span className="font-medium">{result.imported} links imported successfully</span>
              </div>
              {result.conflicts > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <span>{result.conflicts} had slug conflicts (imported with new codes)</span>
                </div>
              )}
              {result.errors > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <span>{result.errors} failed to import</span>
                </div>
              )}
            </div>
            <Button asChild size="lg" className="mt-2">
              <a href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CSV Upload option */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              Or upload a CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Export your links from any provider as CSV and upload here. The CSV should
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
