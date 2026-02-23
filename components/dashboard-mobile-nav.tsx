"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Settings, LogOut, Users } from "lucide-react"

export function DashboardMobileNav({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="text-base">Dashboard</SheetTitle>
        <nav className="mt-6 flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Links
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard/team">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>

        <div className="mt-auto border-t pt-4 absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {userName[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start mt-2 text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
