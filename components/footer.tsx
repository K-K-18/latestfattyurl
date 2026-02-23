import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Fatty<span className="text-primary">URL</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Enterprise-grade URL shortener. Free forever. No ads. No limits.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-12">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Product</p>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Shortener
                </Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  API Docs
                </Link>
                <Link href="/migrate" className="hover:text-foreground transition-colors">
                  Migrate Links
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Company</p>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Login
                </Link>
              </nav>
            </div>
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold">Legal</p>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} FattyURL. Free and open source.
        </div>
      </div>
    </footer>
  )
}
