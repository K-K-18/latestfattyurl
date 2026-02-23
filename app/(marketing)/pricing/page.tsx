import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing | FattyURL",
  description:
    "FattyURL pricing plans. Free forever with unlimited links. Pro and Business plans for teams and enterprises.",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to shorten links. No catches.",
    cta: "Get Started Free",
    ctaHref: "/login",
    highlighted: false,
    features: [
      "Unlimited short links",
      "Full click analytics",
      "QR code generation",
      "Custom slugs",
      "Password-protected links",
      "Link expiration",
      "API access (1000 req/hr)",
      "Bitly migration tool",
      "Export data anytime",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For creators and small businesses who want more.",
    cta: "Upgrade to Pro",
    ctaHref: "/login",
    highlighted: true,
    features: [
      "Everything in Free",
      "Custom branded domains",
      "UTM builder",
      "Advanced analytics",
      "Priority API (5000 req/hr)",
      "Bulk link creation",
      "Link tags & folders",
      "Priority email support",
      "No FattyURL branding",
    ],
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For teams that need collaboration and control.",
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Team workspaces (up to 10)",
      "Role-based access control",
      "Webhook integrations",
      "Audit logs",
      "SSO / SAML (coming soon)",
      "Dedicated account manager",
      "Custom API rate limits",
      "SLA guarantee",
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-4">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Free forever.{" "}
          <span className="text-primary">Seriously.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Most URL shorteners charge for features that should be free.
          We give you unlimited links, analytics, and QR codes at no cost.
          Upgrade only if you need team features or custom domains.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.highlighted
                ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                : ""
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ section */}
      <div className="max-w-2xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Is the Free plan really free forever?",
              a: "Yes. Unlimited links, full analytics, QR codes, and API access. No credit card required. No trial period. Free means free.",
            },
            {
              q: "What happens if I hit the API rate limit?",
              a: "Free tier gets 1,000 requests per hour. If you need more, upgrade to Pro (5,000/hr) or Business (custom limits). Rate-limited requests get a 429 response with a Retry-After header.",
            },
            {
              q: "Can I migrate from Bitly?",
              a: "Absolutely. Our built-in migration tool imports all your Bitly links with one click. Custom slugs are preserved when available.",
            },
            {
              q: "Do you sell my data?",
              a: "Never. We don't use third-party analytics or advertising. Your data stays with you. Read our Privacy Policy for details.",
            },
          ].map((faq) => (
            <div key={faq.q} className="border-b pb-4">
              <h3 className="font-semibold mb-1">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
