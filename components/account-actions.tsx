"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download } from "lucide-react"

export function AccountActions() {
  async function handleExport() {
    toast.info("Preparing export...")
    try {
      const res = await fetch("/api/settings/export")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fattyurl-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Export downloaded!")
    } catch {
      toast.error("Failed to export data")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export as CSV
    </Button>
  )
}
