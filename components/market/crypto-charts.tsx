"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CryptoChartConfig {
  id: string
  symbol: string
  name: string
  scriptConfig: Record<string, unknown>
  height?: number
}

// Other 2 crypto charts for right side grid
const OTHER_CRYPTO_CHARTS: CryptoChartConfig[] = [
  {
    id: "ethereum-chart",
    symbol: "ETH",
    name: "Ethereum",
    scriptConfig: {
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
      symbol: "BINANCE:ETHUSDT",
      theme: "dark",
      timezone: "Africa/Tunis",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true,
    },
    height: 320,
  },
  {
    id: "tether-chart",
    symbol: "USDT",
    name: "Tether",
    scriptConfig: {
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
      symbol: "OKX:XAUTUSDT",
      theme: "dark",
      timezone: "Africa/Tunis",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true,
    },
    height: 320,
  },
]

export function CryptoCharts() {
  useEffect(() => {
    // Load the TradingView library globally
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

  return (
    <div className="space-y-4">
      {/* Other 4 Charts - Full Width Stack */}
      <div className="grid grid-cols-1 gap-6">
        {OTHER_CRYPTO_CHARTS.map((chart) => (
          <Card key={chart.id} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{chart.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CryptoChartEmbed chart={chart} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CryptoChartEmbed({ chart }: { chart: CryptoChartConfig }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

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

    // Determine widget type based on config
    let scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    if ("tabs" in chart.scriptConfig) {
      scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
    }

    // Create and inject the script
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = scriptSrc
    script.async = true
    script.innerHTML = JSON.stringify(chart.scriptConfig)

    widgetContainer.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [chart.id])

  return (
    <div
      ref={containerRef}
      style={{ height: `${chart.height ?? 300}px`, width: "100%" }}
      className="w-full overflow-hidden rounded-md"
    />
  )
}
