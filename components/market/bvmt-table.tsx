"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, RefreshCw, Building2, AlertCircle, Clock } from "lucide-react"
import type { BVMTStock, BVMTIndex } from "@/app/api/market/bvmt/route"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface BVMTData {
  success: boolean
  source: string
  market_status: string
  trading_hours: string
  data: {
    stocks: BVMTStock[]
    indices: BVMTIndex[]
  }
  last_updated: string
  note: string
}

const SECTOR_COLORS: Record<string, string> = {
  Banking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Insurance: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Industry: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Technology: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Leasing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  Distribution: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
}

export function BVMTTable() {
  const { data, error, isLoading, mutate } = useSWR<BVMTData>(
    "/api/market/bvmt",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedSector, setSelectedSector] = useState<string>("all")

  useEffect(() => {
    if (data?.data) {
      setLastUpdated(new Date())
    }
  }, [data])

  const handleRefresh = () => {
    mutate()
  }

  const sectors = data?.data.stocks
    ? ["all", ...new Set(data.data.stocks.map(s => s.sector))]
    : ["all"]

  const filteredStocks = data?.data.stocks.filter(
    s => selectedSector === "all" || s.sector === selectedSector
  ) || []

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Bourse de Tunis (BVMT)</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Tunisian Stock Exchange
                <Badge
                  variant={data?.market_status === "open" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {data?.market_status === "open" ? "Market Open" : "Market Closed"}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {data?.trading_hours || "09:00 - 14:00 CET"}
            </div>
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
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p>Failed to load BVMT data</p>
            <Button variant="link" onClick={handleRefresh} className="mt-2">
              Try again
            </Button>
          </div>
        ) : (
          <>
            {/* Market Indices */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data?.data.indices.map((index) => (
                <Card key={index.name} className="border-border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{index.name}</span>
                      <span className={`flex items-center gap-1 text-sm ${index.change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {index.change_percent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {index.change_percent >= 0 ? "+" : ""}{index.change_percent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">{index.value.toLocaleString()}</span>
                      <span className={`text-sm ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sector Filter Tabs */}
            <Tabs value={selectedSector} onValueChange={setSelectedSector}>
              <TabsList className="flex-wrap h-auto gap-1">
                {sectors.map((sector) => (
                  <TabsTrigger key={sector} value={sector} className="text-xs">
                    {sector === "all" ? "All Sectors" : sector}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedSector} className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Symbol</TableHead>
                        <TableHead className="text-muted-foreground">Company</TableHead>
                        <TableHead className="text-muted-foreground">Sector</TableHead>
                        <TableHead className="text-right text-muted-foreground">Price (TND)</TableHead>
                        <TableHead className="text-right text-muted-foreground">Change</TableHead>
                        <TableHead className="text-right text-muted-foreground">Open</TableHead>
                        <TableHead className="text-right text-muted-foreground">High</TableHead>
                        <TableHead className="text-right text-muted-foreground">Low</TableHead>
                        <TableHead className="text-right text-muted-foreground">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStocks.map((stock) => (
                        <TableRow key={stock.symbol} className="border-border hover:bg-muted/50">
                          <TableCell className="font-bold text-foreground">
                            {stock.symbol}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground" title={stock.name}>
                            {stock.name}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${SECTOR_COLORS[stock.sector] || "bg-gray-100 text-gray-800"}`}>
                              {stock.sector}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-foreground">
                            {stock.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`flex items-center justify-end gap-1 ${stock.change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {stock.change_percent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {stock.open.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            {stock.high.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                            {stock.low.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {stock.volume.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            {/* Note */}
            {data?.note && (
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {data.note}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
