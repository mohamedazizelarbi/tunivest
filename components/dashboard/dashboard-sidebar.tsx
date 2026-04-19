"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/types"
import {
  TrendingUp,
  LayoutDashboard,
  Wallet,
  LineChart,
  Lightbulb,
  History,
  Calculator,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

interface DashboardSidebarProps {
  profile: Profile | null
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/dashboard/invest", icon: TrendingUp },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Recommendations", href: "/dashboard/recommendations", icon: Lightbulb },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Simulator", href: "/dashboard/simulator", icon: Calculator },
  { name: "Market", href: "/market", icon: LineChart },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <TrendingUp className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">TuniVest</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {profile?.full_name || profile?.email || "User"}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {profile?.email}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col bg-sidebar lg:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
