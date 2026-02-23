import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Check, Shield, Globe, Zap, Users, Code2, Heart } from "lucide-react"

export const metadata = {
  title: "About",
  description: "FattyURL is a completely free, enterprise-grade URL shortener. No ads, no limits, no compromises.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          About <span className="text-primary">FattyURL</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          FattyURL is an enterprise-grade URL shortener built because the internet
          deserves better than expensive paywalls for basic link management. No ads. No limits. No compromises.
        </p>
      </div>

      <div className="space-y-16">
        {/* Why FattyURL */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Why FattyURL?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Unlimited short links — no signup required",
              "Full analytics — clicks, devices, countries, referrers",
              "Free QR codes for every link with custom colors & sizes",
              "Custom slugs at no extra cost",
              "Password-protected links with bcrypt hashing",
              "Full REST API included (1,000 req/hr free)",
              "No data retention limits — analytics kept forever",
              "Team workspaces with role-based access",
              "Webhook integrations with HMAC signatures",
              "Open source and self-hostable",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section>
          <h2 className="text-2xl font-bold mb-6">FattyURL vs The Competition</h2>
          <div className="rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Feature</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">FattyURL</th>
                    <th className="px-4 py-3 text-center font-semibold">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Short links", "Unlimited", "10/month free"],
                    ["Custom slugs", "Free", "$29/mo+"],
                    ["Analytics", "Full, forever", "30 days free"],
                    ["QR codes", "Free", "$35/mo+"],
                    ["API access", "Free (1K req/hr)", "$29/mo+"],
                    ["Team workspaces", "Free on Business", "$50/mo+"],
                    ["Custom domains", "Pro ($9/mo)", "$35/mo+"],
                    ["Webhooks", "Business ($29/mo)", "Enterprise only"],
                    ["Price", "Free forever", "$29-199/mo"],
                  ].map(([feature, fatty, others]) => (
                    <tr key={feature} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{feature}</td>
                      <td className="px-4 py-3 text-center text-primary font-medium">{fatty}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart, title: "Free First", desc: "Core features are free forever. We believe essential tools should be accessible to everyone." },
              { icon: Shield, title: "Privacy Focused", desc: "No third-party analytics or advertising. Your data stays with you. Period." },
              { icon: Code2, title: "Open Source", desc: "Built in the open. Self-host on your own infrastructure with Docker." },
              { icon: Globe, title: "Enterprise Ready", desc: "Team workspaces, audit logs, webhooks, and custom domains for serious businesses." },
              { icon: Users, title: "Community Driven", desc: "Built by developers, for developers. Feature requests and contributions welcome." },
              { icon: Zap, title: "Fast & Reliable", desc: "Edge-optimized redirects. Built on modern infrastructure for maximum uptime." },
            ].map((v) => (
              <Card key={v.title} className="p-5 hover:shadow-md transition-shadow">
                <v.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Migration */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Migration</h2>
          <p className="text-muted-foreground mb-4">
            Switching from another URL shortener? Use our migration tool to import all your
            existing links in minutes. We&apos;ll preserve your custom slugs where possible.
          </p>
          <Button asChild>
            <Link href="/migrate">
              Migrate Your Links
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
