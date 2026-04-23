import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PortfolioDeleteButton } from "@/components/dashboard/portfolio-delete-button"

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: portfolio } = await supabase
    .from("portfolio")
    .select(`
      *,
      investment:investments(*)
    `)
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false })

  const totalValue = portfolio?.reduce((sum, p) => sum + p.current_value, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">My Portfolio</h1>
        <p className="text-muted-foreground">
          Total Value: <span className="font-semibold text-foreground">{totalValue.toLocaleString()} TND</span>
        </p>
      </div>

      {portfolio && portfolio.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item) => {
            const invested = item.amount * item.purchase_price
            const profit = item.current_value - invested
            const profitPercent = invested > 0 ? (profit / invested) * 100 : 0
            const isPositive = profit >= 0

            return (
              <Card key={item.id} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-foreground">
                        {item.display_name || item.investment?.name || "Unknown"}
                      </CardTitle>
                      <Badge variant="outline" className="text-muted-foreground">
                        {item.deal_type || (item.investment ? categoryLabels[item.investment.category] || item.investment.category : "N/A")}
                      </Badge>
                    </div>
                    <PortfolioDeleteButton portfolioId={item.id} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">{item.amount} units</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Purchase Price</p>
                      <p className="font-semibold text-foreground">{item.purchase_price.toLocaleString()} TND</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="text-xl font-bold text-foreground">
                          {item.current_value.toLocaleString()} TND
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {isPositive ? "+" : ""}{profitPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{profit.toLocaleString()} TND profit
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any investments yet. Start building your portfolio!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
