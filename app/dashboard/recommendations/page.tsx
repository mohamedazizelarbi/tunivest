import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AiRecommendationPanel } from "@/components/dashboard/ai-recommendation-panel"
import { getBudgetFromSavings, mapToleranceToRiskProfile } from "@/lib/onboarding"
import type {
  AiRecommendationInvestment,
  AiRecommendationProfile,
  InvestmentPreference,
  RiskTolerance,
} from "@/lib/types"
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

const durationTargets: Record<string, number> = {
  short: 12,
  medium: 24,
  long: 60,
}

const preferenceCategoryMap: Record<InvestmentPreference, string[]> = {
  stocks: ["stocks"],
  crypto: ["crypto"],
  real_estate: ["real_estate"],
  forex: ["stocks", "crypto"],
  business: ["stocks", "funds", "real_estate"],
}

function matchesPreference(investment: AiRecommendationInvestment, preferences: InvestmentPreference[]) {
  if (preferences.length === 0) {
    return true
  }

  return preferences.some((preference) => preferenceCategoryMap[preference]?.includes(investment.category))
}

function getTargetRisk(tolerance: RiskTolerance | null | undefined) {
  if (tolerance === "low") return 3
  if (tolerance === "high") return 8
  return 5
}

function getTargetDurationMonths(duration: string | null | undefined) {
  if (!duration) return 24
  return durationTargets[duration] || 24
}

function scoreInvestment(
  investment: AiRecommendationInvestment,
  userProfile: {
    budget_min_tnd: number | null
    budget_max_tnd: number | null
    risk_tolerance: RiskTolerance | null
    investment_duration: string | null
    preferences: InvestmentPreference[]
  },
) {
  const budgetMin = userProfile.budget_min_tnd ?? 0
  const budgetMax = userProfile.budget_max_tnd ?? 0
  const targetRisk = getTargetRisk(userProfile.risk_tolerance)
  const targetDuration = getTargetDurationMonths(userProfile.investment_duration)

  let score = 0

  if (budgetMax > 0) {
    if (investment.min_amount <= budgetMax) {
      score += 30
    } else {
      score -= Math.min(20, ((investment.min_amount - budgetMax) / budgetMax) * 20)
    }

    if (investment.min_amount >= budgetMin) {
      score += 8
    }
  }

  const riskDistance = Math.abs(investment.risk_level - targetRisk)
  score += Math.max(0, 28 - riskDistance * 6)

  const durationDistance = Math.abs(investment.duration_months - targetDuration)
  score += Math.max(0, 18 - durationDistance / 2)

  if (matchesPreference(investment, userProfile.preferences)) {
    score += 18
  }

  if (investment.expected_return >= 10) {
    score += 5
  }

  return score
}

function selectInvestmentCandidates(
  investments: AiRecommendationInvestment[],
  userProfile: {
    budget_min_tnd: number | null
    budget_max_tnd: number | null
    risk_tolerance: RiskTolerance | null
    investment_duration: string | null
    preferences: InvestmentPreference[]
  },
) {
  const scored = investments
    .map((investment) => ({
      ...investment,
      score: scoreInvestment(investment, userProfile),
    }))
    .sort((left, right) => right.score - left.score)

  const strictMatches = scored.filter((investment) => {
    const budgetMax = userProfile.budget_max_tnd ?? 0
    const targetRisk = getTargetRisk(userProfile.risk_tolerance)
    const targetDuration = getTargetDurationMonths(userProfile.investment_duration)

    return (
      (budgetMax === 0 || investment.min_amount <= budgetMax) &&
      Math.abs(investment.risk_level - targetRisk) <= 3 &&
      Math.abs(investment.duration_months - targetDuration) <= 24 &&
      matchesPreference(investment, userProfile.preferences)
    )
  })

  if (strictMatches.length >= 5) {
    return strictMatches.slice(0, 10).map(({ score, ...investment }) => investment)
  }

  return scored.slice(0, Math.min(10, Math.max(5, scored.length))).map(({ score, ...investment }) => investment)
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
    .select("email, full_name, salary, risk_profile")
    .eq("id", user.id)
    .maybeSingle()

  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("personality_type, age_range, employment_status, monthly_income_range, savings_range, risk_tolerance, investment_knowledge, primary_goal, investment_duration, preferences, budget_min_tnd, budget_max_tnd, completed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: activeInvestments } = await supabase
    .from("investments")
    .select("id, name, description, category, min_amount, expected_return, risk_level, duration_months")
    .eq("is_active", true)

  const normalizedInvestments: AiRecommendationInvestment[] = (activeInvestments || []).map((investment) => ({
    id: investment.id,
    name: investment.name,
    description: investment.description,
    category: investment.category,
    min_amount: Number(investment.min_amount),
    expected_return: Number(investment.expected_return),
    risk_level: Number(investment.risk_level),
    duration_months: Number(investment.duration_months),
  }))

  const budgetRange = userProfile?.savings_range ? getBudgetFromSavings(userProfile.savings_range) : null
  const derivedProfile = userProfile
    ? {
        user_id: user.id,
        email: profile?.email ?? user.email ?? null,
        full_name: profile?.full_name ?? null,
        salary: profile?.salary ?? null,
        risk_profile: profile?.risk_profile || mapToleranceToRiskProfile(userProfile.risk_tolerance || "medium"),
        personality_type: userProfile.personality_type ?? null,
        age_range: userProfile.age_range ?? null,
        employment_status: userProfile.employment_status ?? null,
        monthly_income_range: userProfile.monthly_income_range ?? null,
        savings_range: userProfile.savings_range ?? null,
        risk_tolerance: userProfile.risk_tolerance ?? null,
        investment_knowledge: userProfile.investment_knowledge ?? null,
        primary_goal: userProfile.primary_goal ?? null,
        investment_duration: userProfile.investment_duration ?? null,
        preferences: (userProfile.preferences || []) as InvestmentPreference[],
        budget_min_tnd: budgetRange?.min ?? userProfile.budget_min_tnd ?? null,
        budget_max_tnd: budgetRange?.max ?? userProfile.budget_max_tnd ?? null,
        completed_at: userProfile.completed_at ?? null,
      }
    : null

  const filteredInvestments =
    derivedProfile && normalizedInvestments.length > 0
      ? selectInvestmentCandidates(normalizedInvestments, {
          budget_min_tnd: derivedProfile.budget_min_tnd,
          budget_max_tnd: derivedProfile.budget_max_tnd,
          risk_tolerance: derivedProfile.risk_tolerance,
          investment_duration: derivedProfile.investment_duration,
          preferences: derivedProfile.preferences,
        })
      : []

  const aiRequestPayload = derivedProfile && filteredInvestments.length > 0
    ? {
        profile: {
          ...derivedProfile,
          preferences: Array.from(new Set(derivedProfile.preferences)),
        } satisfies AiRecommendationProfile,
        investments: filteredInvestments,
      }
    : null

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

      <AiRecommendationPanel requestPayload={aiRequestPayload} />

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
