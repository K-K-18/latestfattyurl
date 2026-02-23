"use client"

import { useEffect, useState } from "react"

export function LinkCounter() {
  const [stats, setStats] = useState<{ totalLinks: number; linksToday: number } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/stats", { signal: controller.signal })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})

    return () => controller.abort()
  }, [])

  if (!stats || stats.totalLinks === 0) return null

  return (
    <div className="mt-8 flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
      <div className="text-center">
        <span className="block text-lg sm:text-xl font-bold text-foreground">
          {stats.linksToday.toLocaleString()}
        </span>
        <span className="text-xs">links today</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <span className="block text-lg sm:text-xl font-bold text-foreground">
          {stats.totalLinks.toLocaleString()}
        </span>
        <span className="text-xs">total links</span>
      </div>
    </div>
  )
}
