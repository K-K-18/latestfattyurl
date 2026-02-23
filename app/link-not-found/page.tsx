import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Link2 } from "lucide-react"

export const metadata = {
  title: "Link Not Found",
}

export default function LinkNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Link2 className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        This link doesn&apos;t exist
      </p>
      <p className="mt-2 text-muted-foreground max-w-md">
        It may have expired, been deactivated, or never existed in the first place.
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="lg" asChild>
          <Link href="/">
            <Zap className="mr-2 h-4 w-4" />
            Create your own short link
          </Link>
        </Button>
      </div>
    </div>
  )
}
