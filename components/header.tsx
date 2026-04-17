"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TrendingUp, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: { email: string; full_name?: string | null; is_admin?: boolean } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tickerContainerRef = useRef<HTMLDivElement | null>(null)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Investments", href: "/investments" },
    { name: "Market", href: "/market" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    if (!tickerContainerRef.current) return

    const container = tickerContainerRef.current
    container.innerHTML = ""

    const style = document.createElement("style")
    style.textContent = `
      .ticker-tape-host .tradingview-widget-copyright {
        width: 100% !important;
        text-align: right !important;
        padding-right: 12px !important;
        box-sizing: border-box !important;
      }

      .ticker-tape-host .tradingview-widget-copyright a {
        display: inline !important;
      }
    `
    container.appendChild(style)

    const ticker = document.createElement("tv-ticker-tape")
    ticker.setAttribute(
      "symbols",
      "NASDAQ:TSLA,NASDAQ:NVDA,NASDAQ:AAPL,NASDAQ:MSFT,NASDAQ:AMD,NASDAQ:AMZN,NASDAQ:NFLX,NASDAQ:META,NASDAQ:GOOGL,NASDAQ:WMT"
    )
    ticker.setAttribute("hide-chart", "")
    ticker.setAttribute("line-chart-type", "Line")
    ticker.setAttribute("transparent", "")

    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"

    container.appendChild(ticker)
    container.appendChild(script)

    const alignAttributionRight = () => {
      // Fallback for light DOM render mode.
      const copyrightBlocks = container.querySelectorAll<HTMLElement>(
        ".tradingview-widget-copyright"
      )

      copyrightBlocks.forEach((block) => {
        block.style.width = "100%"
        block.style.textAlign = "right"
        block.style.paddingRight = "12px"
        block.style.boxSizing = "border-box"
      })

      const tradingViewLink = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find(
        (link) => link.textContent?.includes("TradingView")
      )

      if (tradingViewLink?.parentElement instanceof HTMLElement) {
        tradingViewLink.parentElement.style.width = "100%"
        tradingViewLink.parentElement.style.textAlign = "right"
        tradingViewLink.parentElement.style.paddingRight = "12px"
        tradingViewLink.parentElement.style.boxSizing = "border-box"
      }

      // Preferred path: target attribution inside open shadow DOM if exposed.
      const tickerElement = container.querySelector("tv-ticker-tape") as HTMLElement | null
      const shadowRoot = tickerElement?.shadowRoot
      if (!shadowRoot) return

      const shadowBlocks = shadowRoot.querySelectorAll<HTMLElement>(".tradingview-widget-copyright")
      shadowBlocks.forEach((block) => {
        block.style.width = "100%"
        block.style.textAlign = "right"
        block.style.paddingRight = "12px"
        block.style.boxSizing = "border-box"
      })

      const shadowLink = Array.from(shadowRoot.querySelectorAll<HTMLAnchorElement>("a")).find(
        (link) => link.textContent?.includes("TradingView")
      )

      if (shadowLink?.parentElement instanceof HTMLElement) {
        shadowLink.parentElement.style.width = "100%"
        shadowLink.parentElement.style.textAlign = "right"
        shadowLink.parentElement.style.paddingRight = "12px"
        shadowLink.parentElement.style.boxSizing = "border-box"
      }
    }

    const observer = new MutationObserver(() => {
      alignAttributionRight()
    })

    observer.observe(container, { childList: true, subtree: true })

    const tickerElement = container.querySelector("tv-ticker-tape") as HTMLElement | null
    const shadowObserver =
      tickerElement?.shadowRoot
        ? new MutationObserver(() => {
            alignAttributionRight()
          })
        : null

    if (shadowObserver && tickerElement?.shadowRoot) {
      shadowObserver.observe(tickerElement.shadowRoot, { childList: true, subtree: true })
    }

    const alignTimeout = window.setTimeout(() => {
      alignAttributionRight()
    }, 400)

    const secondAlignTimeout = window.setTimeout(() => {
      alignAttributionRight()
    }, 1200)

    return () => {
      observer.disconnect()
      shadowObserver?.disconnect()
      window.clearTimeout(alignTimeout)
      window.clearTimeout(secondAlignTimeout)
      container.innerHTML = ""
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="border-b border-border/70 bg-background/80">
        <div ref={tickerContainerRef} className="ticker-tape-host min-h-[52px] w-full overflow-hidden" />
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TuniVest</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link href={user.is_admin ? "/admin" : "/dashboard"}>
                <Button variant="ghost" size="sm">
                  {user.is_admin ? "Admin Panel" : "Dashboard"}
                </Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-border" />
            {user ? (
              <>
                <Link
                  href={user.is_admin ? "/admin" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    {user.is_admin ? "Admin Panel" : "Dashboard"}
                  </Button>
                </Link>
                <form action="/auth/signout" method="post">
                  <Button variant="outline" size="sm" className="w-full" type="submit">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
