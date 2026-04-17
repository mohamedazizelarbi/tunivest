import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Transaction } from "@/lib/types"
import { ArrowRight } from "lucide-react"

interface RecentTransactionsTableProps {
  transactions: (Transaction & {
    investment: { name: string } | null
    profile: { full_name: string | null; email: string } | null
  })[]
}

const typeConfig: Record<string, { label: string; color: string }> = {
  buy: { label: "Buy", color: "bg-green-100 text-green-800" },
  sell: { label: "Sell", color: "bg-red-100 text-red-800" },
  dividend: { label: "Dividend", color: "bg-blue-100 text-blue-800" },
  withdrawal: { label: "Withdrawal", color: "bg-orange-100 text-orange-800" },
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        <Link href="/admin/transactions">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No transactions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-right text-muted-foreground">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const config = typeConfig[tx.type] || typeConfig.buy
                return (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.profile?.full_name || tx.profile?.email || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.investment?.name || "Unknown Investment"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={config.color}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === "buy" || tx.type === "dividend" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "buy" || tx.type === "dividend" ? "+" : "-"}{tx.total_value.toLocaleString()} TND
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
