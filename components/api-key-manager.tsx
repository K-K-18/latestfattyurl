"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Copy, Check, RefreshCw } from "lucide-react"

export function ApiKeyManager({ apiKey }: { apiKey: string }) {
  const [key, setKey] = useState(apiKey)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(key)
    setCopied(true)
    toast.success("API key copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    if (!confirm("Regenerate your API key? The old key will stop working immediately.")) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/settings/regenerate-key", { method: "POST" })
      const data = await res.json()
      if (data.apiKey) {
        setKey(data.apiKey)
        toast.success("API key regenerated!")
      }
    } catch {
      toast.error("Failed to regenerate key")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          readOnly
          value={showKey ? key : key.replace(/./g, "\u2022")}
          className="font-mono text-sm"
        />
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
          {showKey ? "Hide" : "Reveal"} key
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>
    </div>
  )
}
