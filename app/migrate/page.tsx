import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MigrationWizard } from "@/components/migration-wizard"

export const metadata = {
  title: "Migrate Your Links",
  description: "Import all your links from other URL shorteners to FattyURL in minutes. Free analytics forever, no limits.",
}

export default function MigratePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Migrate Your Links
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Import all your links from other URL shorteners to FattyURL in minutes.
          Free analytics forever, no limits.
        </p>
        <MigrationWizard />
      </main>
      <Footer />
    </div>
  )
}
