"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsData {
  clicksByDate: { date: string; count: number }[]
  topCountries: { country: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

function generateSrSummary(label: string, data: { name: string; value: number }[]): string {
  if (data.length === 0) return `${label}: No data available.`
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const top3 = data.slice(0, 3).map((d) => `${d.name} (${d.value})`).join(", ")
  return `${label}: ${total} total. Top items: ${top3}.`
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const totalClicks = data.clicksByDate.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="space-y-6">
      {/* Clicks over time */}
      <Card>
        <CardHeader>
          <CardTitle id="chart-clicks-title">Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {data.clicksByDate.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No click data for this period
            </p>
          ) : (
            <div
              role="img"
              aria-labelledby="chart-clicks-title"
              aria-describedby="chart-clicks-desc"
            >
              <span id="chart-clicks-desc" className="sr-only">
                Area chart showing {totalClicks} total clicks over{" "}
                {data.clicksByDate.length} days. Peak was{" "}
                {Math.max(...data.clicksByDate.map((d) => d.count))} clicks.
              </span>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("en", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.2}
                    name="Clicks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle id="chart-countries-title">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div
                role="img"
                aria-labelledby="chart-countries-title"
                aria-describedby="chart-countries-desc"
              >
                <span id="chart-countries-desc" className="sr-only">
                  {generateSrSummary(
                    "Countries bar chart",
                    data.topCountries.map((c) => ({ name: c.country, value: c.count }))
                  )}
                </span>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.topCountries} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="country" type="category" className="text-xs" width={40} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle id="chart-devices-title">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {data.deviceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div
                role="img"
                aria-labelledby="chart-devices-title"
                aria-describedby="chart-devices-desc"
              >
                <span id="chart-devices-desc" className="sr-only">
                  {generateSrSummary(
                    "Device breakdown pie chart",
                    data.deviceBreakdown.map((d) => ({ name: d.device, value: d.count }))
                  )}
                </span>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="device"
                        label={({ name, value }) => `${name ?? "?"}: ${value}`}
                      >
                        {data.deviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle id="chart-browsers-title">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.browserBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div
                role="img"
                aria-labelledby="chart-browsers-title"
                aria-describedby="chart-browsers-desc"
              >
                <span id="chart-browsers-desc" className="sr-only">
                  {generateSrSummary(
                    "Browser breakdown bar chart",
                    data.browserBreakdown.map((b) => ({ name: b.browser, value: b.count }))
                  )}
                </span>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.browserBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="browser" type="category" className="text-xs" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle id="chart-referrers-title">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
            ) : (
              <div aria-labelledby="chart-referrers-title" aria-describedby="chart-referrers-desc">
                <span id="chart-referrers-desc" className="sr-only">
                  {generateSrSummary(
                    "Top referrers list",
                    data.topReferrers.map((r) => ({ name: r.referrer, value: r.count }))
                  )}
                </span>
                <div className="space-y-2">
                  {data.topReferrers.slice(0, 10).map((r) => (
                    <div key={r.referrer} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px]">{r.referrer}</span>
                      <span className="font-mono text-muted-foreground">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
