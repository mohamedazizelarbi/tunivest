"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { MarketData } from "@/lib/types"

interface MarketTableProps {
  marketData: (MarketData & {
    investment: { id: string; name: string; category: string } | null
  })[]
}

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

export function MarketTable({ marketData }: MarketTableProps) {
  // Group by investment and get the latest data for each
  const latestByInvestment = marketData.reduce((acc, item) => {
    if (!item.investment) return acc
    if (!acc[item.investment_id] || new Date(item.recorded_at) > new Date(acc[item.investment_id].recorded_at)) {
      acc[item.investment_id] = item
    }
    return acc
  }, {} as Record<string, typeof marketData[0]>)

  const uniqueData = Object.values(latestByInvestment)

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Latest Market Prices</CardTitle>
      </CardHeader>
      <CardContent>
        {uniqueData.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No market data available yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Investment</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-right text-muted-foreground">Price (TND)</TableHead>
                <TableHead className="text-right text-muted-foreground">Change</TableHead>
                <TableHead className="text-right text-muted-foreground">Volume</TableHead>
                <TableHead className="text-right text-muted-foreground">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {item.investment?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      {item.investment ? categoryLabels[item.investment.category] || item.investment.category : "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {item.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-1 ${item.change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.change_percent >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {item.change_percent >= 0 ? "+" : ""}{item.change_percent.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {item.volume.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(item.recorded_at).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
