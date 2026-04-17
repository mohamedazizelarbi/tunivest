import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const typeConfig: Record<string, { label: string; color: string }> = {
  buy: { label: "Buy", color: "bg-green-100 text-green-800" },
  sell: { label: "Sell", color: "bg-red-100 text-red-800" },
  dividend: { label: "Dividend", color: "bg-blue-100 text-blue-800" },
  withdrawal: { label: "Withdrawal", color: "bg-orange-100 text-orange-800" },
}

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      investment:investments(name),
      profile:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  const totalVolume = transactions?.reduce((sum, t) => sum + t.total_value, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Transaction History</h1>
        <p className="text-muted-foreground">
          Total Volume: <span className="font-semibold text-foreground">{totalVolume.toLocaleString()} TND</span>
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Transactions ({transactions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Investment</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-right text-muted-foreground">Price</TableHead>
                  <TableHead className="text-right text-muted-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const config = typeConfig[tx.type] || typeConfig.buy
                  return (
                    <TableRow key={tx.id} className="border-border">
                      <TableCell className="text-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {tx.profile?.full_name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.profile?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {tx.investment?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {tx.price_per_unit.toLocaleString()} TND
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${tx.type === "buy" || tx.type === "dividend" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "buy" || tx.type === "dividend" ? "+" : "-"}{tx.total_value.toLocaleString()} TND
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
