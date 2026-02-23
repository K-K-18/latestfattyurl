"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Link2,
  LayoutDashboard,
  Settings,
  BarChart3,
  FileText,
  ArrowRightLeft,
  Info,
  LogIn,
  Sun,
  Moon,
  Home,
  QrCode,
} from "lucide-react"
import { useTheme } from "next-themes"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function navigate(path: string) {
    setOpen(false)
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/")}>
            <Link2 className="mr-2 h-4 w-4" />
            Create New Link
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dashboard/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </CommandItem>
          <CommandItem onSelect={() => navigate("/about")}>
            <Info className="mr-2 h-4 w-4" />
            About
          </CommandItem>
          <CommandItem onSelect={() => navigate("/docs")}>
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </CommandItem>
          <CommandItem onSelect={() => navigate("/migrate")}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Migrate Links
          </CommandItem>
          <CommandItem onSelect={() => navigate("/login")}>
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              setTheme("light")
              setOpen(false)
            }}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme("dark")
              setOpen(false)
            }}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
