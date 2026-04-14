import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react"

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

const getRiskLabel = (risk: number) => {
  if (risk <= 3) return "Low Risk"
  if (risk <= 6) return "Medium Risk"
  return "High Risk"
}

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select(`
      *,
      investment:investments(*)
    `)
    .eq("user_id", user.id)
    .order("score", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("risk_profile")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">AI Recommendations</h1>
        <p className="text-muted-foreground">
          Personalized suggestions based on your{" "}
          <span className="font-semibold capitalize text-primary">{profile?.risk_profile || "moderate"}</span> risk profile
        </p>
      </div>

      <Card className="border-border bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Lightbulb className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">How We Choose Recommendations</p>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your risk profile, salary, and market conditions to suggest the best investments for you.
            </p>
          </div>
        </CardContent>
      </Card>

      {recommendations && recommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Card key={rec.id} className={`border-border ${rec.is_viewed ? "opacity-70" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground">
                      {rec.investment?.name || "Unknown"}
                    </CardTitle>
                    <CardDescription>
                      {rec.investment ? categoryLabels[rec.investment.category] || rec.investment.category : "N/A"}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    {rec.score}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {rec.reason}
                </p>

                {rec.investment && (
                  <>
                    <div className="flex items-center justify-between">
                      <Badge className={getRiskColor(rec.investment.risk_level)}>
                        {getRiskLabel(rec.investment.risk_level)}
                      </Badge>
                      {rec.is_viewed && (
                        <span className="text-xs text-muted-foreground">Viewed</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <TrendingUp className="mx-auto h-4 w-4 text-green-600" />
                        <p className="mt-1 text-xs text-muted-foreground">Return</p>
                        <p className="text-sm font-semibold text-foreground">{rec.investment.expected_return}%</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                        <p className="mt-1 text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{rec.investment.duration_months}mo</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <AlertTriangle className="mx-auto h-4 w-4 text-muted-foreground" />
                        <p className="mt-1 text-xs text-muted-foreground">Risk</p>
                        <p className="text-sm font-semibold text-foreground">{rec.investment.risk_level}/10</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Minimum Investment</p>
                      <p className="text-lg font-bold text-primary">
                        {rec.investment.min_amount.toLocaleString()} TND
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/invest/${rec.investment_id}`} className="w-full">
                  <Button className="w-full gap-2">
                    Invest Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No recommendations available yet. Complete your profile to get personalized suggestions!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
