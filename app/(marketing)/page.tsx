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
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-20 sm:py-28 max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-accent/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          100% Free &middot; No ads &middot; No limits
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Shorten links.
          <br />
          <span className="text-primary">Track everything.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
          The free URL shortener that doesn&apos;t suck. Create short links, generate QR
          codes, and get full analytics — without paying a dime. Ever.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <ShortenerForm />
        </div>

        <LinkCounter />
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl mx-auto pb-20">
        <h2 className="text-center text-2xl font-bold mb-12">
          Everything Bitly charges for. <span className="text-primary">We don&apos;t.</span>
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Link2 className="h-5 w-5" />}
            title="Unlimited Links"
            description="No signup needed. Create as many short links as you want with custom slugs. Free forever."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Full Analytics"
            description="Track clicks, devices, browsers, countries, and referrers. Data retained forever."
          />
          <FeatureCard
            icon={<QrCode className="h-5 w-5" />}
            title="QR Codes"
            description="Every link gets a free QR code. Download as PNG or SVG with custom colors and sizes."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Password Protection"
            description="Lock sensitive links behind a password. Only people with the password can access them."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="REST API"
            description="Full API access included. Automate link creation, management, and analytics."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" />}
            title="Bitly Migration"
            description="Switch from Bitly in minutes. Import all your links and keep your custom slugs."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-3xl mx-auto pb-24">
        <div className="rounded-2xl border bg-card p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to ditch the paywall?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands who switched to FattyURL. No credit card. No trial
            periods. Just free.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
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
    <div className="group rounded-xl border bg-card p-6 text-card-foreground transition-colors hover:border-primary/30 hover:bg-accent/30">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
