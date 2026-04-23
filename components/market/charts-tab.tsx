"use client"

import { memo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

type QuoteSymbol = {
  name: string
  displayName: string
}

interface MarketQuotesWidgetProps {
  categoryName: string
  symbols: QuoteSymbol[]
  height: number
}

interface SymbolOverviewWidgetProps {
  height: number
}

const STOCKS_SYMBOLS: QuoteSymbol[] = [
  { name: "NASDAQ:TSLA", displayName: "" },
  { name: "NASDAQ:NVDA", displayName: "" },
  { name: "NASDAQ:AAPL", displayName: "" },
  { name: "NASDAQ:MSFT", displayName: "" },
  { name: "NASDAQ:AMD", displayName: "" },
  { name: "NASDAQ:NFLX", displayName: "" },
  { name: "NASDAQ:AMZN", displayName: "" },
  { name: "NASDAQ:PLTR", displayName: "" },
  { name: "NASDAQ:META", displayName: "" },
  { name: "NASDAQ:MU", displayName: "" },
  { name: "NYSE:ORCL", displayName: "" },
  { name: "NASDAQ:GOOGL", displayName: "" },
  { name: "NASDAQ:COIN", displayName: "" },
  { name: "NASDAQ:INTC", displayName: "" },
  { name: "NYSE:NKE", displayName: "" },
  { name: "NASDAQ:PYPL", displayName: "" },
  { name: "NASDAQ:WMT", displayName: "" },
  { name: "NYSE:DIS", displayName: "" },
  { name: "NYSE:IBM", displayName: "" },
]

const INDICES_SYMBOLS: QuoteSymbol[] = [
  { name: "FOREXCOM:SPXUSD", displayName: "S&P 500 Index" },
  { name: "FOREXCOM:NSXUSD", displayName: "US 100 Cash CFD" },
  { name: "FOREXCOM:DJI", displayName: "Dow Jones Industrial Average Index" },
  { name: "INDEX:NKY", displayName: "Japan 225" },
  { name: "INDEX:DEU40", displayName: "DAX Index" },
  { name: "FOREXCOM:UKXGBP", displayName: "FTSE 100 Index" },
]

const FUTURES_SYMBOLS: QuoteSymbol[] = [
  { name: "BMFBOVESPA:ISP1!", displayName: "S&P 500" },
  { name: "BMFBOVESPA:EUR1!", displayName: "Euro" },
  { name: "CMCMARKETS:GOLD", displayName: "Gold" },
  { name: "PYTH:WTI3!", displayName: "WTI Crude Oil" },
  { name: "BMFBOVESPA:CCM1!", displayName: "Corn" },
]

const FOREX_SYMBOLS: QuoteSymbol[] = [
  { name: "FX:EURUSD", displayName: "EUR to USD" },
  { name: "FX:GBPUSD", displayName: "GBP to USD" },
  { name: "FX:USDJPY", displayName: "USD to JPY" },
  { name: "FX:USDCHF", displayName: "USD to CHF" },
  { name: "FX:AUDUSD", displayName: "AUD to USD" },
  { name: "FX:USDCAD", displayName: "USD to CAD" },
  { name: "FX_IDC:TNDUSD", displayName: "" },
  { name: "FX_IDC:TNDEUR", displayName: "" },
]

function MarketQuotesWidget({ categoryName, symbols, height }: MarketQuotesWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const root = containerRef.current
    root.innerHTML = ""

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const widgetInner = document.createElement("div")
    widgetInner.className = "tradingview-widget-container__widget"
    widgetInner.style.height = "100%"
    widgetInner.style.width = "100%"

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      backgroundColor: "#0F0F0F",
      support_host: "https://www.tradingview.com",
      width: "100%",
      height: "100%",
      symbolsGroups: [
        {
          name: categoryName,
          symbols,
        },
      ],
    })

    widgetContainer.appendChild(widgetInner)
    widgetContainer.appendChild(script)
    root.appendChild(widgetContainer)

    return () => {
      root.innerHTML = ""
    }
  }, [categoryName, symbols])

  return (
    <div
      className="w-full overflow-hidden rounded-md"
      style={{ height: `${height}px` }}
      ref={containerRef}
    />
  )
}

const MemoMarketQuotesWidget = memo(MarketQuotesWidget)

function SymbolOverviewWidget({ height }: SymbolOverviewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const root = containerRef.current
    root.innerHTML = ""

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const widgetInner = document.createElement("div")
    widgetInner.className = "tradingview-widget-container__widget"
    widgetInner.style.height = "100%"
    widgetInner.style.width = "100%"

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      lineWidth: 2,
      lineType: 0,
      chartType: "area",
      fontColor: "rgb(106, 109, 120)",
      gridLineColor: "rgba(242, 242, 242, 0.06)",
      volumeUpColor: "rgba(34, 171, 148, 0.5)",
      volumeDownColor: "rgba(247, 82, 95, 0.5)",
      backgroundColor: "#0F0F0F",
      widgetFontColor: "#DBDBDB",
      upColor: "#22ab94",
      downColor: "#f7525f",
      borderUpColor: "#22ab94",
      borderDownColor: "#f7525f",
      wickUpColor: "#22ab94",
      wickDownColor: "#f7525f",
      colorTheme: "dark",
      isTransparent: false,
      locale: "en",
      chartOnly: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      valuesTracking: "1",
      changeMode: "price-and-percent",
      symbols: [
        ["Apple", "NASDAQ:AAPL|3M"],
        ["Google", "NASDAQ:GOOGL|3M"],
        ["Microsoft", "NASDAQ:MSFT|3M"],
        ["NASDAQ:NFLX|3M"],
        ["NASDAQ:AMZN|3M"],
        ["NASDAQ:TSLA|3M"],
      ],
      dateRanges: ["3m|60", "12m|1D", "60m|1W", "all|1M"],
      fontSize: "10",
      headerFontSize: "medium",
      autosize: true,
      width: "100%",
      height: "100%",
      noTimeScale: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
    })

    widgetContainer.appendChild(widgetInner)
    widgetContainer.appendChild(script)
    root.appendChild(widgetContainer)

    return () => {
      root.innerHTML = ""
    }
  }, [])

  return (
    <div
      className="w-full overflow-hidden rounded-md"
      style={{ height: `${height}px` }}
      ref={containerRef}
    />
  )
}

const MemoSymbolOverviewWidget = memo(SymbolOverviewWidget)

export function ChartsTab() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-foreground">Global Market Quotes</CardTitle>
            <CardDescription className="flex items-center gap-2">
              TradingView market widgets by category
              <Badge variant="secondary" className="text-xs">4 Categories</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border bg-muted/30 lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Stocks</CardTitle>
                <Badge variant="outline" className="text-xs">20 Symbols</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MemoMarketQuotesWidget
                categoryName="Stocks"
                symbols={STOCKS_SYMBOLS}
                height={580}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Stock Symbol Overview</p>
                  <Badge variant="outline" className="text-xs">6 Symbols</Badge>
                </div>
                <MemoSymbolOverviewWidget height={520} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Indices</CardTitle>
                  <Badge variant="outline" className="text-xs">6 Symbols</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MemoMarketQuotesWidget
                  categoryName="Indices"
                  symbols={INDICES_SYMBOLS}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Futures</CardTitle>
                  <Badge variant="outline" className="text-xs">5 Symbols</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MemoMarketQuotesWidget
                  categoryName="Futures"
                  symbols={FUTURES_SYMBOLS}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Forex</CardTitle>
                  <Badge variant="outline" className="text-xs">6 Symbols</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MemoMarketQuotesWidget
                  categoryName="Forex"
                  symbols={FOREX_SYMBOLS}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
