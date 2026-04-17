"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Globe, Building2, Bitcoin, Clock } from "lucide-react"

export function MarketOverview() {
  const now = new Date()
  const hour = now.getHours()
  
  // Market status based on time
  const isTunisiaOpen = hour >= 9 && hour < 14 && now.getDay() !== 0 && now.getDay() !== 6
  const isUSOpen = hour >= 14 && hour < 21 && now.getDay() !== 0 && now.getDay() !== 6
  const isCryptoOpen = true // 24/7

  const markets = [
    {
      name: "BVMT (Tunisia)",
      icon: Building2,
      status: isTunisiaOpen ? "open" : "closed",
      hours: "09:00 - 14:00 CET",
      description: "Tunisian Stock Exchange with 75+ listed companies",
      color: "bg-primary",
    },
    {
      name: "Crypto Markets",
      icon: Bitcoin,
      status: isCryptoOpen ? "open" : "closed",
      hours: "24/7",
      description: "Bitcoin, Ethereum and top cryptocurrencies",
      color: "bg-secondary",
    },
    {
      name: "Global Markets",
      icon: Globe,
      status: isUSOpen ? "open" : "closed",
      hours: "14:30 - 21:00 CET",
      description: "US markets (NYSE, NASDAQ) reference",
      color: "bg-muted",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {now.toLocaleString("en-TN", { 
            weekday: "short",
            hour: "2-digit", 
            minute: "2-digit",
            timeZoneName: "short"
          })}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {markets.map((market) => (
          <Card key={market.name} className="border-border overflow-hidden">
            <CardContent className="p-0">
              <div className={`${market.color} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <market.icon className="h-5 w-5 text-primary-foreground" />
                    <span className="font-semibold text-primary-foreground">{market.name}</span>
                  </div>
                  <Badge 
                    variant={market.status === "open" ? "default" : "secondary"}
                    className={market.status === "open" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-gray-500 text-white"
                    }
                  >
                    {market.status === "open" ? (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        Open
                      </span>
                    ) : (
                      "Closed"
                    )}
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground">{market.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Trading Hours: {market.hours}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStat
          label="TND/USD Rate"
          value="3.12"
          change={-0.15}
          suffix=" TND"
        />
        <QuickStat
          label="TND/EUR Rate"
          value="3.38"
          change={0.08}
          suffix=" TND"
        />
        <QuickStat
          label="Gold (oz)"
          value="2,342"
          change={1.23}
          prefix="$"
        />
        <QuickStat
          label="Oil (Brent)"
          value="82.45"
          change={-0.67}
          prefix="$"
        />
      </div>
    </div>
  )
}

function QuickStat({ 
  label, 
  value, 
  change, 
  prefix = "", 
  suffix = "" 
}: { 
  label: string
  value: string
  change: number
  prefix?: string
  suffix?: string
}) {
  const isPositive = change >= 0
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xl font-bold text-foreground">
            {prefix}{value}{suffix}
          </span>
          <span className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{change.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
