import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | FattyURL",
  description: "How FattyURL collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: February 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Account Data:</strong> When you create an account via OAuth (Google, GitHub), we store
            your name, email address, and profile image provided by the OAuth provider. We do not store
            passwords for OAuth users.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Link Data:</strong> When you create shortened links, we store the original URL, custom
            slugs, titles, and creation timestamps.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Analytics Data:</strong> When someone clicks a shortened link, we collect anonymous
            analytics including: referrer URL, country/city (from request headers), device type, browser,
            operating system, and a one-way hash of the IP address. We never store raw IP addresses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>To provide and maintain the URL shortening service</li>
            <li>To show you analytics for your shortened links</li>
            <li>To prevent abuse and enforce rate limits</li>
            <li>To improve the service based on aggregate usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies only for authentication sessions. We do not use tracking cookies,
            advertising cookies, or third-party analytics. Your theme preference is stored in localStorage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, rent, or share your personal data with third parties. We do not use any
            third-party analytics or advertising services. Your data stays with us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Links created by authenticated users are retained indefinitely unless deleted by the user.
            Anonymous links (created without an account) are retained for 30 days. Click analytics data
            is retained for 12 months. You can delete your links and associated analytics at any time
            from your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights (GDPR/CCPA)</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Access:</strong> You can view all your data in the dashboard</li>
            <li><strong>Export:</strong> You can export your links via the API or settings page</li>
            <li><strong>Deletion:</strong> You can delete individual links or request full account deletion</li>
            <li><strong>Portability:</strong> Export your data in JSON format at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including: encrypted connections (HTTPS),
            hashed API keys, rate limiting, CSRF protection, and Content Security Policy headers.
            IP addresses are hashed with HMAC-SHA256 before storage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related inquiries, please contact us at{" "}
            <a href="mailto:privacy@fattyurl.com" className="text-primary hover:underline">
              privacy@fattyurl.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
