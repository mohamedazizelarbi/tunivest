"use client"

import { useRef, useEffect } from "react"

interface BitcoinChartProps {
  height?: number
}

const BITCOIN_CHART_CONFIG = {
  allow_symbol_change: true,
  calendar: false,
  details: false,
  hide_side_toolbar: true,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  hotlist: false,
  interval: "D",
  locale: "en",
  save_image: true,
  style: "1",
  symbol: "BINANCE:BTCUSDT",
  theme: "dark",
  timezone: "Africa/Tunis",
  backgroundColor: "#0F0F0F",
  gridColor: "rgba(242, 242, 242, 0.06)",
  watchlist: [],
  withdateranges: false,
  compareSymbols: [],
  studies: [],
  autosize: true,
}

export function BitcoinChart({ height = 350 }: BitcoinChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Load TradingView library
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ""

    // Create the widget container
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"
    container.appendChild(widgetContainer)

    // Create the inner widget div
    const innerDiv = document.createElement("div")
    innerDiv.className = "tradingview-widget-container__widget"
    innerDiv.style.height = "100%"
    innerDiv.style.width = "100%"
    widgetContainer.appendChild(innerDiv)

    // Create and inject the script
    const scriptTag = document.createElement("script")
    scriptTag.type = "text/javascript"
    scriptTag.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    scriptTag.async = true
    scriptTag.innerHTML = JSON.stringify(BITCOIN_CHART_CONFIG)

    widgetContainer.appendChild(scriptTag)

    return () => {
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="w-full overflow-hidden rounded-md"
    />
  )
}
