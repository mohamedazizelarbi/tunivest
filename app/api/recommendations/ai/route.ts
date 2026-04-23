import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type {
  AiRecommendationInvestment,
  AiRecommendationProfile,
  AiRecommendationResponse,
  AiRecommendationSuggestion,
} from "@/lib/types"

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27307885/ujagftr/"
const REQUEST_TIMEOUT_MS = 20000

const investmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().min(1),
  min_amount: z.number().nonnegative(),
  expected_return: z.number().nonnegative(),
  risk_level: z.number().min(0).max(10),
  duration_months: z.number().nonnegative(),
})

const profileSchema = z.object({
  user_id: z.string().min(1),
  email: z.string().email().nullable().optional(),
  full_name: z.string().nullable().optional(),
  salary: z.number().nullable().optional(),
  risk_profile: z.enum(["conservative", "moderate", "aggressive"]),
  personality_type: z.string().nullable().optional(),
  age_range: z.string().nullable().optional(),
  employment_status: z.string().nullable().optional(),
  monthly_income_range: z.string().nullable().optional(),
  savings_range: z.string().nullable().optional(),
  risk_tolerance: z.string().nullable().optional(),
  investment_knowledge: z.string().nullable().optional(),
  primary_goal: z.string().nullable().optional(),
  investment_duration: z.string().nullable().optional(),
  preferences: z.array(z.string()).default([]),
  budget_min_tnd: z.number().nullable().optional(),
  budget_max_tnd: z.number().nullable().optional(),
  completed_at: z.string().nullable().optional(),
})

const requestSchema = z.object({
  profile: profileSchema,
  investments: z.array(investmentSchema).min(1),
})

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function buildInvestmentLookup(investments: AiRecommendationInvestment[]) {
  const byId = new Map<string, AiRecommendationInvestment>()
  const byName = new Map<string, AiRecommendationInvestment>()

  investments.forEach((investment) => {
    byId.set(investment.id, investment)
    byName.set(normalizeText(investment.name), investment)
  })

  return { byId, byName }
}

function resolveInvestment(candidate: Record<string, unknown>, investments: AiRecommendationInvestment[]) {
  const { byId, byName } = buildInvestmentLookup(investments)

  const directId = candidate.investmentId ?? candidate.investment_id ?? candidate.id
  if (typeof directId === "string") {
    const matchedById = byId.get(directId)
    if (matchedById) {
      return matchedById
    }
  }

  const directName = candidate.name ?? candidate.investment_name ?? candidate.title
  if (typeof directName === "string") {
    const matchedByName = byName.get(normalizeText(directName))
    if (matchedByName) {
      return matchedByName
    }
  }

  return null
}

function normalizeRecommendation(item: unknown, investments: AiRecommendationInvestment[]): AiRecommendationSuggestion | null {
  if (!item || typeof item !== "object") {
    return null
  }

  const candidate = item as Record<string, unknown>
  const matchedInvestment = resolveInvestment(candidate, investments)

  if (!matchedInvestment) {
    return null
  }

  const reason =
    (typeof candidate.reason === "string" && candidate.reason) ||
    (typeof candidate.explanation === "string" && candidate.explanation) ||
    (typeof candidate.message === "string" && candidate.message) ||
    `Matched to real investment ${matchedInvestment.name}.`

  const riskValue =
    (typeof candidate.risk === "string" && candidate.risk) ||
    (typeof candidate.risk_level === "string" && candidate.risk_level) ||
    (typeof candidate.risk_level === "number" && `Risk ${candidate.risk_level}/10`) ||
    (typeof candidate.riskScore === "number" && `Risk ${candidate.riskScore}/10`) ||
    `Risk ${matchedInvestment.risk_level}/10`

  const expectedReturn = toNumber(
    candidate.expectedReturn ?? candidate.expected_return ?? candidate.return ?? candidate.projected_return ?? matchedInvestment.expected_return,
  )

  return {
    investmentId: matchedInvestment.id,
    name: matchedInvestment.name,
    reason,
    risk: riskValue,
    expectedReturn,
  }
}

function fallbackRecommendation(investment: AiRecommendationInvestment): AiRecommendationSuggestion {
  return {
    investmentId: investment.id,
    name: investment.name,
    reason: `Matched to your real catalog. This investment stays within your filtered profile window and has a ${investment.duration_months}-month horizon with ${investment.risk_level}/10 risk.`,
    risk: `Risk ${investment.risk_level}/10`,
    expectedReturn: investment.expected_return,
  }
}

function extractSummary(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "AI recommendations were generated successfully."
  }

  const candidate = payload as Record<string, unknown>
  const directSummary = candidate.summary ?? candidate.analysis ?? candidate.message ?? candidate.text

  if (typeof directSummary === "string" && directSummary.trim().length > 0) {
    return directSummary
  }

  const nested = candidate.data
  if (nested && typeof nested === "object") {
    const nestedSummary = (nested as Record<string, unknown>).summary
    if (typeof nestedSummary === "string" && nestedSummary.trim().length > 0) {
      return nestedSummary
    }
  }

  return "AI recommendations were generated successfully."
}

function extractRawText(payload: unknown): string {
  if (typeof payload === "string") {
    return payload.trim()
  }

  if (!payload || typeof payload !== "object") {
    return ""
  }

  const candidate = payload as Record<string, unknown>
  const directText = candidate.text ?? candidate.message ?? candidate.output ?? candidate.result

  if (typeof directText === "string" && directText.trim().length > 0) {
    return directText.trim()
  }

  const nested = candidate.data
  if (nested && typeof nested === "object") {
    const nestedText = (nested as Record<string, unknown>).text ?? (nested as Record<string, unknown>).message ?? (nested as Record<string, unknown>).output
    if (typeof nestedText === "string" && nestedText.trim().length > 0) {
      return nestedText.trim()
    }
  }

  return ""
}

function extractRecommendations(
  payload: unknown,
  investments: AiRecommendationInvestment[],
): AiRecommendationSuggestion[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeRecommendation(item, investments)).filter(Boolean) as AiRecommendationSuggestion[]
  }

  if (!payload || typeof payload !== "object") {
    return []
  }

  const candidate = payload as Record<string, unknown>
  const directList = candidate.recommendations ?? candidate.data ?? candidate.results

  if (Array.isArray(directList)) {
    return directList.map((item) => normalizeRecommendation(item, investments)).filter(Boolean) as AiRecommendationSuggestion[]
  }

  if (directList && typeof directList === "object") {
    const nested = directList as Record<string, unknown>
    if (Array.isArray(nested.recommendations)) {
      return nested.recommendations.map((item) => normalizeRecommendation(item, investments)).filter(Boolean) as AiRecommendationSuggestion[]
    }
  }

  return []
}

function buildFallbackRecommendations(
  investments: AiRecommendationInvestment[],
): AiRecommendationSuggestion[] {
  return investments.slice(0, Math.min(5, investments.length)).map(fallbackRecommendation)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "profile and investments are required.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    )
  }

  const { profile, investments } = parsed.data

  if (profile.user_id !== user.id) {
    return NextResponse.json({ error: "Profile does not match the authenticated user." }, { status: 403 })
  }

  const sanitizedProfile: AiRecommendationProfile = {
    ...profile,
    preferences: Array.from(new Set(profile.preferences)).slice(0, 10),
  }

  const trimmedInvestments: AiRecommendationInvestment[] = investments.slice(0, 10)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
      body: JSON.stringify({
        profile: sanitizedProfile,
        investments: trimmedInvestments,
        meta: {
          user_id: user.id,
          investment_count: trimmedInvestments.length,
          source: "dashboard-recommendations",
          generated_at: new Date().toISOString(),
        },
      }),
      signal: controller.signal,
    })

    const text = await response.text()
    let payload: unknown = null

    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = text
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Zapier webhook request failed.",
          details: typeof payload === "string" ? payload : undefined,
        },
        { status: 502 },
      )
    }

    const normalized: AiRecommendationResponse = {
      summary: extractSummary(payload),
      recommendations: extractRecommendations(payload, trimmedInvestments),
    }

    const rawText = extractRawText(payload)
    if (normalized.recommendations.length === 0 && trimmedInvestments.length > 0) {
      normalized.recommendations = buildFallbackRecommendations(trimmedInvestments)
      normalized.summary = rawText || normalized.summary
    }

    return NextResponse.json({
      success: true,
      source: "zapier",
      data: normalized,
    })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError"

    return NextResponse.json(
      {
        error: isTimeout
          ? "Zapier webhook timed out. Please try again."
          : "Unable to reach the AI recommendation service.",
      },
      { status: isTimeout ? 504 : 502 },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}