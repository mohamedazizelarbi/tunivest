import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

const getRiskColor = (risk: number) => {
  if (risk <= 3) return "bg-green-100 text-green-800"
  if (risk <= 6) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

export default async function AdminInvestmentsPage() {
  const supabase = await createClient()

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Investment Management</h1>
        <p className="text-muted-foreground">View and manage all investment products</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Investments ({investments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {investments && investments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-right text-muted-foreground">Min Amount</TableHead>
                  <TableHead className="text-right text-muted-foreground">Return</TableHead>
                  <TableHead className="text-muted-foreground">Risk</TableHead>
                  <TableHead className="text-right text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((inv) => (
                  <TableRow key={inv.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {inv.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {categoryLabels[inv.category] || inv.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {inv.min_amount.toLocaleString()} TND
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {inv.expected_return}%
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(inv.risk_level)}>
                        {inv.risk_level}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {inv.duration_months} mo.
                    </TableCell>
                    <TableCell>
                      {inv.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No investments found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
