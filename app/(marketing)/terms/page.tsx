import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | FattyURL",
  description: "Terms governing the use of FattyURL URL shortening service.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: February 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using FattyURL (&quot;the Service&quot;), you agree to these Terms of Service.
            If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            FattyURL provides URL shortening, link analytics, QR code generation, and related services.
            The free tier is available to all users with no usage limits. Paid tiers offer additional
            features such as custom domains, team management, and priority support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            You agree not to use FattyURL to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Distribute malware, phishing links, or other malicious content</li>
            <li>Shorten links to illegal or harmful content</li>
            <li>Spam or engage in bulk link creation for deceptive purposes</li>
            <li>Attempt to circumvent rate limits or abuse the API</li>
            <li>Impersonate other individuals or organizations</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We reserve the right to disable any link or account that violates these terms without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. API Usage</h2>
          <p className="text-muted-foreground leading-relaxed">
            API access is provided for legitimate integration purposes. Rate limits apply to all API
            endpoints. Automated bulk operations must comply with rate limits. API keys are for your
            use only and must not be shared.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain all rights to the URLs you shorten. FattyURL does not claim ownership of your
            content. The FattyURL name, logo, and service are our intellectual property.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Service Level</h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive for 99.9% uptime but do not guarantee uninterrupted service. The Service is
            provided &quot;as is&quot; without warranty of any kind. We are not liable for any damages
            arising from the use or inability to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall FattyURL be liable for any indirect, incidental, special, consequential,
            or punitive damages, including loss of profits, data, or business opportunities, regardless
            of the cause of action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account at any time for violation of these terms.
            You may delete your account at any time. Upon termination, your data will be deleted
            in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of the Service constitutes
            acceptance of the updated terms. We will notify registered users of material changes
            via email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms? Contact us at{" "}
            <a href="mailto:legal@fattyurl.com" className="text-primary hover:underline">
              legal@fattyurl.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
