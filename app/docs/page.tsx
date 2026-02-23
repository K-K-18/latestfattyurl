import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "API Documentation",
  description: "Complete API documentation for FattyURL. Create and manage short links programmatically.",
}

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/shorten",
    description: "Create a short link",
    auth: "Optional (Bearer token for link ownership)",
    body: `{
  "url": "https://example.com/very-long-url",
  "customSlug": "my-link" // optional
}`,
    response: `{
  "shortUrl": "https://fattyurl.com/abc1234",
  "shortCode": "abc1234",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2024-01-01T00:00:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/links",
    description: "List your links",
    auth: "Required (Bearer token)",
    body: null,
    response: `{
  "links": [...],
  "total": 42,
  "page": 1,
  "totalPages": 3
}`,
  },
  {
    method: "GET",
    path: "/api/v1/links/:id",
    description: "Get link details with analytics summary",
    auth: "Required",
    body: null,
    response: `{
  "id": "...",
  "shortUrl": "...",
  "originalUrl": "...",
  "clicks": 150,
  "isActive": true,
  ...
}`,
  },
  {
    method: "PATCH",
    path: "/api/v1/links/:id",
    description: "Update a link",
    auth: "Required",
    body: `{
  "originalUrl": "https://new-url.com",  // optional
  "customSlug": "new-slug",              // optional
  "isActive": false,                     // optional
  "title": "My Link"                     // optional
}`,
    response: `{ "id": "...", "shortUrl": "...", ... }`,
  },
  {
    method: "DELETE",
    path: "/api/v1/links/:id",
    description: "Delete a link",
    auth: "Required",
    body: null,
    response: `{ "success": true }`,
  },
  {
    method: "GET",
    path: "/api/v1/links/:id/clicks",
    description: "Get click data for a link",
    auth: "Required",
    body: null,
    response: `{
  "clicks": [
    {
      "clickedAt": "...",
      "country": "US",
      "browser": "Chrome",
      ...
    }
  ],
  "total": 150
}`,
  },
]

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    POST: "bg-green-500/10 text-green-600 dark:text-green-400",
    PATCH: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    DELETE: "bg-red-500/10 text-red-600 dark:text-red-400",
  }
  return (
    <span className={`text-xs font-mono font-semibold px-2 py-1 rounded ${colors[method] || ""}`}>
      {method}
    </span>
  )
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Use the FattyURL API to create and manage short links programmatically.
            All endpoints return JSON.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Include your API key in the Authorization header:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
              Authorization: Bearer YOUR_API_KEY
            </pre>
            <p className="text-sm text-muted-foreground">
              Find your API key in{" "}
              <a href="/dashboard/settings" className="text-primary hover:underline">
                Dashboard &rarr; Settings
              </a>
              . Rate limit: 1,000 requests/hour.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <Card key={ep.path + ep.method}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MethodBadge method={ep.method} />
                  <code className="text-sm font-mono">{ep.path}</code>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{ep.description}</p>
                <p className="text-xs text-muted-foreground">
                  Auth: {ep.auth}
                </p>
                {ep.body && (
                  <div>
                    <p className="text-xs font-medium mb-1.5">Request body:</p>
                    <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                      {ep.body}
                    </pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium mb-1.5">Response:</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {ep.response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>HTTP Status Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div><code className="text-green-600 dark:text-green-400 font-mono">200</code> — Success</div>
              <div><code className="text-green-600 dark:text-green-400 font-mono">201</code> — Created</div>
              <div><code className="text-yellow-600 dark:text-yellow-400 font-mono">400</code> — Bad request</div>
              <div><code className="text-yellow-600 dark:text-yellow-400 font-mono">401</code> — Unauthorized</div>
              <div><code className="text-yellow-600 dark:text-yellow-400 font-mono">404</code> — Not found</div>
              <div><code className="text-yellow-600 dark:text-yellow-400 font-mono">409</code> — Conflict (slug taken)</div>
              <div><code className="text-red-600 dark:text-red-400 font-mono">429</code> — Rate limited</div>
              <div><code className="text-red-600 dark:text-red-400 font-mono">500</code> — Server error</div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
