"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TrendingUp, TrendingDown, RefreshCw, Bitcoin, AlertCircle } from "lucide-react"
import type { CryptoData } from "@/app/api/market/crypto/route"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function CryptoTable() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    source: string
    data: CryptoData[]
    message?: string
  }>("/api/market/crypto", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (data?.data) {
      setLastUpdated(new Date())
    }
  }, [data])

  const handleRefresh = () => {
    mutate()
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    if (price >= 1) return `$${price.toFixed(2)}`
    if (price >= 0.01) return `$${price.toFixed(4)}`
    return `$${price.toFixed(8)}`
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Bitcoin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Cryptocurrency Market</CardTitle>
              <CardDescription>
                Real-time prices from CoinMarketCap
                {data?.source === "mock" && (
                  <Badge variant="outline" className="ml-2 text-xs">Demo Data</Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        {data?.message && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {data.message}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p>Failed to load cryptocurrency data</p>
            <Button variant="link" onClick={handleRefresh} className="mt-2">
              Try again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-right text-muted-foreground">Price</TableHead>
                  <TableHead className="text-right text-muted-foreground">1h %</TableHead>
                  <TableHead className="text-right text-muted-foreground">24h %</TableHead>
                  <TableHead className="text-right text-muted-foreground">7d %</TableHead>
                  <TableHead className="text-right text-muted-foreground">Market Cap</TableHead>
                  <TableHead className="text-right text-muted-foreground">Volume (24h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((crypto, index) => (
                  <TableRow key={crypto.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{crypto.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {crypto.symbol}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-foreground">
                      {formatPrice(crypto.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell value={crypto.change_1h} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell value={crypto.change_24h} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell value={crypto.change_7d} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMarketCap(crypto.market_cap)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMarketCap(crypto.volume_24h)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChangeCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`flex items-center justify-end gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{value.toFixed(2)}%
    </span>
  )
}
