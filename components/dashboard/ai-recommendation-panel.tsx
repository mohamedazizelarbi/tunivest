"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  AiRecommendationInvestment,
  AiRecommendationProfile,
  AiRecommendationResponse,
} from "@/lib/types"
import { AlertTriangle, BrainCircuit, Loader2, Sparkles, TrendingUp } from "lucide-react"

interface AiRecommendationPanelProps {
  requestPayload: {
    profile: AiRecommendationProfile
    investments: AiRecommendationInvestment[]
  } | null
}

const riskBadgeClass = (risk: string) => {
  const normalized = risk.toLowerCase()

  if (normalized.includes("low") || normalized.includes("conservative")) {
    return "bg-green-100 text-green-800"
  }

  if (normalized.includes("high") || normalized.includes("aggressive")) {
    return "bg-red-100 text-red-800"
  }

  return "bg-yellow-100 text-yellow-800"
}

export function AiRecommendationPanel({ requestPayload }: AiRecommendationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AiRecommendationResponse | null>(null)

  const handleGenerate = async () => {
    if (!requestPayload) {
      setError("Complete your profile to generate AI recommendations.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/recommendations/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const payload = (await response.json()) as {
        success?: boolean
        data?: AiRecommendationResponse
        error?: string
      }

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Unable to generate recommendations right now.")
      }

      setResult(payload.data)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate recommendations right now."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const isOnboardingComplete = !!requestPayload?.profile.completed_at
  const candidateCount = requestPayload?.investments.length || 0

  return (
    <Card className="border-border bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BrainCircuit className="h-5 w-5 text-primary" />
              AI Recommendation Engine
            </CardTitle>
            <CardDescription>
              Send your profile and {candidateCount} filtered investment ideas to Zapier for a structured recommendation.
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary">Zapier webhook</Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleGenerate} disabled={loading || !isOnboardingComplete} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get AI Recommendation
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            We only send the most relevant 5-10 opportunities, capped at 10.
          </p>
        </div>

        {!isOnboardingComplete && (
          <div className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
            Finish your onboarding profile to unlock personalized AI recommendations.
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {result ? (
          <>
            <Card className="border-border bg-background/80">
              <CardContent className="flex items-start gap-3 py-4">
                <AlertTriangle className="mt-1 h-5 w-5 text-secondary-foreground" />
                <div>
                  {result.source === "fallback" && (
                    <p className="mb-2 text-sm font-semibold text-foreground">
                      The AI service is currently unavailable.
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
              </CardContent>
            </Card>

            {result.recommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.recommendations.map((recommendation) => (
                  <Card key={recommendation.investmentId} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base text-foreground">{recommendation.name}</CardTitle>
                        <Badge className={riskBadgeClass(recommendation.risk)}>{recommendation.risk}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Expected return</p>
                        <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          {recommendation.expectedReturn}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                The AI service did not return any structured recommendations. Try again or adjust your profile filters.
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
            Click the button above to generate a structured AI response from Zapier. The result will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  )
}