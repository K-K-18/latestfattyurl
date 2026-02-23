import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"

export const metadata = {
  title: "About",
  description: "FattyURL is a completely free URL shortener built to compete with Bitly. No ads, no limits, no BS.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        About <span className="text-primary">FattyURL</span>
      </h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        FattyURL is a completely free URL shortener built because the internet
        deserves better than $35/month for link tracking. No ads. No limits. No BS.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why FattyURL?</h2>
          <div className="grid gap-3">
            {[
              "Unlimited short links — no signup required",
              "Full analytics — clicks, devices, countries, referrers",
              "Free QR codes for every link with custom colors & sizes",
              "Custom slugs at no extra cost",
              "Password-protected links",
              "Full REST API included",
              "No data retention limits — we keep your analytics forever",
              "Open source and self-hostable",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">FattyURL vs Bitly</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">FattyURL</th>
                  <th className="px-4 py-3 text-center font-semibold">Bitly</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Short links", "Unlimited", "10/month free"],
                  ["Custom slugs", "Free", "$29/mo+"],
                  ["Analytics", "Full, forever", "30 days free"],
                  ["QR codes", "Free", "$35/mo+"],
                  ["API access", "Free", "$29/mo+"],
                  ["Custom domains", "Coming soon", "$35/mo+"],
                  ["Price", "Free forever", "$29-199/mo"],
                ].map(([feature, fatty, bitly]) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{feature}</td>
                    <td className="px-4 py-3 text-center text-primary font-medium">{fatty}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{bitly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Migration</h2>
          <p className="text-muted-foreground mb-4">
            Switching from Bitly? Use our migration tool to import all your
            existing links in minutes. We&apos;ll preserve your custom slugs where possible.
          </p>
          <Button asChild>
            <Link href="/migrate">
              Migrate from Bitly
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
