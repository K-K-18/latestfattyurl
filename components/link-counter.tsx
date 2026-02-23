"use client"

import { useEffect, useState } from "react"

export function LinkCounter() {
  const [stats, setStats] = useState<{ totalLinks: number; linksToday: number } | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats || stats.totalLinks === 0) return null

  return (
    <p className="mt-8 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">
        {stats.linksToday.toLocaleString()}
      </span>{" "}
      links shortened today &middot;{" "}
      <span className="font-semibold text-foreground">
        {stats.totalLinks.toLocaleString()}
      </span>{" "}
      total
    </p>
  )
}
