import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Shield, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact | FattyURL",
  description: "Get in touch with the FattyURL team for support, abuse reports, or general inquiries.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">
        We&apos;re here to help. Choose the best way to reach us.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">General Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Questions about FattyURL, feature requests, or technical support.
            </p>
            <a
              href="mailto:support@fattyurl.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              support@fattyurl.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <CardTitle className="text-lg">Report Abuse</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Report malicious links, phishing, spam, or terms of service violations.
            </p>
            <a
              href="mailto:abuse@fattyurl.com"
              className="text-sm text-red-500 hover:underline font-medium"
            >
              abuse@fattyurl.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Business Inquiries</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Enterprise plans, partnerships, or media inquiries.
            </p>
            <a
              href="mailto:hello@fattyurl.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              hello@fattyurl.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Data deletion requests, GDPR/CCPA inquiries, or privacy concerns.
            </p>
            <a
              href="mailto:privacy@fattyurl.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              privacy@fattyurl.com
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 rounded-lg border bg-muted/50 p-6">
        <h2 className="text-lg font-semibold mb-2">Response Times</h2>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">Abuse Reports</p>
            <p>Within 24 hours</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Support</p>
            <p>1-2 business days</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Business</p>
            <p>2-3 business days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
