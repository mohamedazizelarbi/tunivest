"use client"

import { memo, useEffect, useRef } from "react"

function TradingViewNewsWidget() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = `
      {
        "displayMode": "regular",
        "feedMode": "all_symbols",
        "colorTheme": "light",
        "isTransparent": false,
        "locale": "en",
        "width": "100%",
        "height": 550
      }`

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-xl sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Global Market News</h3>
        <span className="text-xs text-muted-foreground">Live feed</span>
      </div>

      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget" />
        <div className="pt-2 text-[11px] text-muted-foreground">
          <a
            href="https://www.tradingview.com/news/top-providers/tradingview/"
            rel="noopener nofollow"
            target="_blank"
            className="hover:text-foreground"
          >
            Top stories
          </a>{" "}
          by TradingView
        </div>
      </div>
    </div>
  )
}

export default memo(TradingViewNewsWidget)