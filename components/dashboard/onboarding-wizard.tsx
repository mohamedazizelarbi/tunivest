"use client"

import { useMemo, useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type {
  AgeRange,
  EmploymentStatus,
  InvestmentDuration,
  InvestmentKnowledge,
  InvestmentPreference,
  MonthlyIncomeRange,
  PersonalityType,
  PrimaryGoal,
  RiskTolerance,
  SavingsRange,
} from "@/lib/types"
import {
  ageOptions,
  durationOptions,
  employmentOptions,
  getBudgetFromSavings,
  getReadableDuration,
  getReadableRiskTolerance,
  goalOptions,
  incomeOptions,
  knowledgeOptions,
  mapToleranceToRiskProfile,
  personalityOptions,
  preferenceOptions,
  riskToleranceOptions,
  savingsOptions,
} from "@/lib/onboarding"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

type OnboardingData = {
  personality_type: PersonalityType | null
  age_range: AgeRange | null
  employment_status: EmploymentStatus | null
  monthly_income_range: MonthlyIncomeRange | null
  savings_range: SavingsRange | null
  risk_tolerance: RiskTolerance | null
  investment_knowledge: InvestmentKnowledge | null
  primary_goal: PrimaryGoal | null
  investment_duration: InvestmentDuration | null
  preferences: InvestmentPreference[]
}

type Action =
  | { type: "set"; field: keyof OnboardingData; value: OnboardingData[keyof OnboardingData] }
  | { type: "toggle_preference"; value: InvestmentPreference }

const initialData: OnboardingData = {
  personality_type: null,
  age_range: null,
  employment_status: null,
  monthly_income_range: null,
  savings_range: null,
  risk_tolerance: null,
  investment_knowledge: null,
  primary_goal: null,
  investment_duration: null,
  preferences: [],
}

const steps = [
  { title: "Basic Info", subtitle: "Understand who you are" },
  { title: "Financial Situation", subtitle: "Assess your capacity" },
  { title: "Risk Tolerance", subtitle: "Match volatility comfort" },
  { title: "Investment Goals", subtitle: "Define investment intent" },
  { title: "Preferences", subtitle: "Choose preferred markets" },
]

function reducer(state: OnboardingData, action: Action): OnboardingData {
  if (action.type === "toggle_preference") {
    const exists = state.preferences.includes(action.value)
    return {
      ...state,
      preferences: exists
        ? state.preferences.filter((pref) => pref !== action.value)
        : [...state.preferences, action.value],
    }
  }

  return {
    ...state,
    [action.field]: action.value,
  }
}

interface OnboardingWizardProps {
  fullName: string | null
}

export function OnboardingWizard({ fullName }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, dispatch] = useReducer(reducer, initialData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const completionPercent = ((step + 1) / steps.length) * 100

  const userProfile = useMemo(
    () => ({
      age: data.age_range,
      income: data.monthly_income_range,
      savings: data.savings_range,
      risk: data.risk_tolerance,
      knowledge: data.investment_knowledge,
      goal: data.primary_goal,
      duration: data.investment_duration,
      preferences: data.preferences,
    }),
    [data],
  )

  const canProceed = useMemo(() => {
    if (step === 0) return Boolean(data.personality_type && data.age_range && data.employment_status)
    if (step === 1) return Boolean(data.monthly_income_range && data.savings_range)
    if (step === 2) return Boolean(data.risk_tolerance && data.investment_knowledge)
    if (step === 3) return Boolean(data.primary_goal && data.investment_duration)
    if (step === 4) return data.preferences.length > 0
    return false
  }, [data, step])

  const goNext = () => {
    if (!canProceed) {
      setError("Please complete all required fields before continuing.")
      return
    }

    setError(null)
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const goBack = () => {
    setError(null)
    setStep((current) => Math.max(current - 1, 0))
  }

  const finishOnboarding = async () => {
    if (!canProceed) {
      setError("Select at least one preference before finishing.")
      return
    }

    if (
      !data.personality_type ||
      !data.age_range ||
      !data.employment_status ||
      !data.monthly_income_range ||
      !data.savings_range ||
      !data.risk_tolerance ||
      !data.investment_knowledge ||
      !data.primary_goal ||
      !data.investment_duration
    ) {
      setError("Incomplete onboarding data. Please review each step.")
      return
    }

    setError(null)
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setError("Session expired. Please sign in again.")
      setSaving(false)
      return
    }

    const budget = getBudgetFromSavings(data.savings_range)

    const { error: profileError } = await supabase
      .from("user_profile")
      .upsert(
        {
          user_id: user.id,
          personality_type: data.personality_type,
          age_range: data.age_range,
          employment_status: data.employment_status,
          monthly_income_range: data.monthly_income_range,
          savings_range: data.savings_range,
          risk_tolerance: data.risk_tolerance,
          investment_knowledge: data.investment_knowledge,
          primary_goal: data.primary_goal,
          investment_duration: data.investment_duration,
          preferences: data.preferences,
          budget_min_tnd: budget.min,
          budget_max_tnd: budget.max,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

    if (profileError) {
      setError(profileError.message)
      setSaving(false)
      return
    }

    const { error: riskError } = await supabase
      .from("profiles")
      .update({ risk_profile: mapToleranceToRiskProfile(data.risk_tolerance) })
      .eq("id", user.id)

    if (riskError) {
      setError(riskError.message)
      setSaving(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const budgetPreview = data.savings_range ? getBudgetFromSavings(data.savings_range) : null

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome{fullName ? `, ${fullName}` : ""}</CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Complete your onboarding to unlock personalized AI investment recommendations.
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 px-3 py-1 text-primary">Step {step + 1} of {steps.length}</Badge>
        </div>

        <div className="space-y-3">
          <Progress value={completionPercent} className="h-2.5" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-lg border p-2 text-center text-xs transition-all ${
                  index === step
                    ? "border-primary bg-primary/10 text-primary"
                    : index < step
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-[360px] rounded-2xl bg-muted/30 p-4 transition-all duration-300 sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-foreground">{steps[step].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Personality type</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {personalityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => dispatch({ type: "set", field: "personality_type", value: option.value })}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        data.personality_type === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Age range</p>
                  <Select
                    value={data.age_range ?? undefined}
                    onValueChange={(value) => dispatch({ type: "set", field: "age_range", value: value as AgeRange })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Employment status</p>
                  <Select
                    value={data.employment_status ?? undefined}
                    onValueChange={(value) =>
                      dispatch({ type: "set", field: "employment_status", value: value as EmploymentStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Monthly income</p>
                <Select
                  value={data.monthly_income_range ?? undefined}
                  onValueChange={(value) =>
                    dispatch({ type: "set", field: "monthly_income_range", value: value as MonthlyIncomeRange })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Savings available for investment</p>
                <Select
                  value={data.savings_range ?? undefined}
                  onValueChange={(value) => dispatch({ type: "set", field: "savings_range", value: value as SavingsRange })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select savings range" />
                  </SelectTrigger>
                  <SelectContent>
                    {savingsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {budgetPreview && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-primary">Estimated investment budget</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {budgetPreview.min.toLocaleString()} - {budgetPreview.max.toLocaleString()} TND
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">How do you react to financial loss?</p>
                <div className="grid gap-3">
                  {riskToleranceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => dispatch({ type: "set", field: "risk_tolerance", value: option.value })}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        data.risk_tolerance === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Investment knowledge</p>
                <Select
                  value={data.investment_knowledge ?? undefined}
                  onValueChange={(value) =>
                    dispatch({ type: "set", field: "investment_knowledge", value: value as InvestmentKnowledge })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your knowledge level" />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Primary goal</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {goalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => dispatch({ type: "set", field: "primary_goal", value: option.value })}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        data.primary_goal === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Time horizon</p>
                <Select
                  value={data.investment_duration ?? undefined}
                  onValueChange={(value) =>
                    dispatch({ type: "set", field: "investment_duration", value: value as InvestmentDuration })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your investment horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Interested in</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {preferenceOptions.map((option) => {
                  const checked = data.preferences.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                        checked ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => dispatch({ type: "toggle_preference", value: option.value })}
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  )
                })}
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Profile summary</p>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <div>
                    <span className="block text-xs uppercase">Budget</span>
                    <span className="text-foreground">
                      {budgetPreview
                        ? `${budgetPreview.min.toLocaleString()} - ${budgetPreview.max.toLocaleString()} TND`
                        : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase">Risk tolerance</span>
                    <span className="text-foreground">{userProfile.risk ? getReadableRiskTolerance(userProfile.risk) : "Not set"}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase">Duration</span>
                    <span className="text-foreground">{userProfile.duration ? getReadableDuration(userProfile.duration) : "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Your answers are used to generate smarter AI recommendations.
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || saving}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext} disabled={saving}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={finishOnboarding} disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  Finish
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>

      {(error || step === steps.length - 1) && (
        <div className="px-6 pb-6">
          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Finish to activate your personalized AI recommendation workflow.
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
