import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Recommendation, Investment } from "@/lib/types"
import { Lightbulb, ArrowRight, TrendingUp } from "lucide-react"

interface QuickRecommendationsProps {
  recommendations: (Recommendation & { investment: Investment | null })[]
}

export function QuickRecommendations({ recommendations }: QuickRecommendationsProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lightbulb className="h-5 w-5 text-secondary-foreground" />
          AI Recommendations
        </CardTitle>
        <Link href="/dashboard/recommendations">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No new recommendations. Check back later!
          </p>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {rec.investment?.name || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {rec.reason}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    Score: {rec.score}%
                  </Badge>
                </div>
                {rec.investment && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {rec.investment.expected_return}% return
                    </span>
                    <span className="text-muted-foreground">
                      Min: {rec.investment.min_amount.toLocaleString()} TND
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
