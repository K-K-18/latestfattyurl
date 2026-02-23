"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Zap } from "lucide-react"

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold">
            Fatty<span className="text-primary">URL</span>
          </span>
        </SheetTitle>
        <nav className="mt-6 flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/">Home</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/about">About</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/docs">API Docs</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/migrate">Migrate Links</Link>
          </Button>

          <div className="my-3 h-px bg-border" />

          {isLoggedIn ? (
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
