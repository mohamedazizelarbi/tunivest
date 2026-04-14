import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react"

interface RecentTransactionsProps {
  transactions: (Transaction & {
    investment: { name: string; category: string } | null
  })[]
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  buy: { label: "Buy", color: "bg-green-100 text-green-800", icon: ArrowUpRight },
  sell: { label: "Sell", color: "bg-red-100 text-red-800", icon: ArrowDownRight },
  dividend: { label: "Dividend", color: "bg-blue-100 text-blue-800", icon: ArrowUpRight },
  withdrawal: { label: "Withdrawal", color: "bg-orange-100 text-orange-800", icon: ArrowDownRight },
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No transactions yet. Make your first investment!
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type] || typeConfig.buy
              const Icon = config.icon

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tx.type === "buy" || tx.type === "dividend" ? "bg-green-100" : "bg-red-100"}`}>
                      <Icon className={`h-5 w-5 ${tx.type === "buy" || tx.type === "dividend" ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.investment?.name || "Unknown Investment"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "buy" || tx.type === "dividend" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "buy" || tx.type === "dividend" ? "+" : "-"}{tx.total_value.toLocaleString()} TND
                    </p>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
