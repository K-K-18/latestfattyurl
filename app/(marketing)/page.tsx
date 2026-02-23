import { ShortenerForm } from "@/components/shortener-form"
import { LinkCounter } from "@/components/link-counter"
import {
  Link2,
  BarChart3,
  QrCode,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Users,
  Rocket,
  Code2,
  Lock,
  TrendingUp,
  Star,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center py-16 sm:py-24 lg:py-32 max-w-4xl mx-auto px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-accent/50 px-4 py-1.5 text-sm text-muted-foreground animate-fade-in">
            <Zap className="h-3.5 w-3.5 text-primary" />
            100% Free &middot; No ads &middot; No limits
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
            Shorten links.
            <br />
            <span className="text-primary">Track everything.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            The enterprise-grade URL shortener that&apos;s completely free.
            Create short links, generate QR codes, and get full analytics
            — without paying a dime. Ever.
          </p>

          <div className="mt-10 w-full max-w-2xl">
            <ShortenerForm />
          </div>

          <LinkCounter />
        </div>
      </section>

      {/* Social Proof */}
      <section className="w-full border-y bg-muted/30 py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-3xl mx-auto text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Free Forever</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">&infin;</p>
              <p className="text-sm text-muted-foreground mt-1">Unlimited Links</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground mt-1">Ads or Tracking</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                <Star className="h-6 w-6 sm:h-7 sm:w-7 inline" />
              </p>
              <p className="text-sm text-muted-foreground mt-1">Enterprise Grade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto py-16 sm:py-24 px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need. <span className="text-primary">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Built for individuals, teams, and enterprises. All features included in the free tier.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Link2 className="h-5 w-5" />}
            title="Unlimited Links"
            description="Create as many short links as you want with custom slugs. No signup needed. No daily caps."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Full Analytics"
            description="Track clicks, devices, browsers, countries, and referrers. Data retained forever, no 30-day limits."
          />
          <FeatureCard
            icon={<QrCode className="h-5 w-5" />}
            title="QR Codes"
            description="Every link gets a free QR code. Download as PNG or SVG with custom colors and sizes."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Password Protection"
            description="Lock sensitive links behind a password. Bcrypt-hashed for enterprise-grade security."
          />
          <FeatureCard
            icon={<Code2 className="h-5 w-5" />}
            title="REST API"
            description="Full API access with 1,000 req/hr free. Automate link creation, management, and analytics."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" />}
            title="Custom Domains"
            description="Use your own branded domains with DNS verification. Available on Pro and Business plans."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Team Workspaces"
            description="Collaborate with your team. Role-based access control with owner, admin, and member roles."
          />
          <FeatureCard
            icon={<Lock className="h-5 w-5" />}
            title="Enterprise Security"
            description="HMAC-signed webhooks, IP hashing, rate limiting, SSRF protection, and full audit logs."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="UTM Builder"
            description="Built-in UTM parameter builder. Add campaign tracking to any link with zero effort."
          />
        </div>
      </section>

      {/* Comparison section */}
      <section className="w-full bg-muted/30 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why teams choose <span className="text-primary">FattyURL</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Premium features that other services charge $30+/month for. Free forever.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ComparisonCard
              icon={<Rocket className="h-5 w-5" />}
              title="Other URL Shorteners"
              items={[
                "10 links/month on free tier",
                "Analytics limited to 30 days",
                "QR codes locked behind paywall",
                "API access starts at $29/mo",
                "Custom domains at $35/mo+",
              ]}
              negative
            />
            <ComparisonCard
              icon={<Zap className="h-5 w-5" />}
              title="FattyURL"
              items={[
                "Unlimited links, always",
                "Full analytics retained forever",
                "QR codes free with custom colors",
                "API access included (1,000 req/hr)",
                "Custom domains on Pro ($9/mo)",
              ]}
              negative={false}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-3xl mx-auto py-16 sm:py-24 px-4">
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold sm:text-4xl tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of teams using FattyURL. No credit card required.
            No trial periods. Just powerful link management, free forever.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/docs">View API Docs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  )
}

function ComparisonCard({
  icon,
  title,
  items,
  negative,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  negative: boolean
}) {
  return (
    <Card className={`p-6 ${negative ? "opacity-70" : "border-primary/30 shadow-lg shadow-primary/5"}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${negative ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            {negative ? (
              <span className="mt-0.5 text-red-400">&#x2717;</span>
            ) : (
              <span className="mt-0.5 text-green-500">&#x2713;</span>
            )}
            <span className={negative ? "text-muted-foreground" : ""}>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
