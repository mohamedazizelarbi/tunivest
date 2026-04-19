import type {
  AgeRange,
  EmploymentStatus,
  InvestmentDuration,
  InvestmentKnowledge,
  InvestmentPreference,
  MonthlyIncomeRange,
  PersonalityType,
  PrimaryGoal,
  RiskProfile,
  RiskTolerance,
  SavingsRange,
} from "@/lib/types"

export const personalityOptions: { value: PersonalityType; label: string; description: string }[] = [
  { value: "analyst", label: "Analyst", description: "Logical, data-driven and methodical." },
  { value: "diplomat", label: "Diplomat", description: "People-focused, balanced and thoughtful." },
  { value: "sentinel", label: "Sentinel", description: "Structured, careful and reliability-first." },
  { value: "explorer", label: "Explorer", description: "Curious, adaptable and opportunity-seeking." },
]

export const ageOptions: { value: AgeRange; label: string }[] = [
  { value: "under_18", label: "< 18" },
  { value: "18_25", label: "18-25" },
  { value: "26_35", label: "26-35" },
  { value: "36_50", label: "36-50" },
  { value: "50_plus", label: "50+" },
]

export const employmentOptions: { value: EmploymentStatus; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
]

export const incomeOptions: { value: MonthlyIncomeRange; label: string }[] = [
  { value: "lt_1000", label: "< 1000 TND" },
  { value: "1000_3000", label: "1000-3000 TND" },
  { value: "gt_3000", label: "3000+ TND" },
]

export const savingsOptions: { value: SavingsRange; label: string }[] = [
  { value: "lt_500", label: "< 500 TND" },
  { value: "500_2000", label: "500-2000 TND" },
  { value: "2000_5000", label: "2000-5000 TND" },
  { value: "gt_5000", label: "5000+ TND" },
]

export const riskToleranceOptions: { value: RiskTolerance; label: string }[] = [
  { value: "low", label: "I avoid any loss" },
  { value: "medium", label: "I can accept small losses" },
  { value: "high", label: "I accept high volatility" },
]

export const knowledgeOptions: { value: InvestmentKnowledge; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export const goalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: "preserve_money", label: "Preserve money" },
  { value: "grow_steadily", label: "Grow steadily" },
  { value: "maximize_profits", label: "Maximize profits" },
]

export const durationOptions: { value: InvestmentDuration; label: string }[] = [
  { value: "short", label: "< 1 year (short-term)" },
  { value: "medium", label: "1-3 years (mid-term)" },
  { value: "long", label: "3+ years (long-term)" },
]

export const preferenceOptions: { value: InvestmentPreference; label: string }[] = [
  { value: "stocks", label: "Stocks" },
  { value: "crypto", label: "Crypto" },
  { value: "real_estate", label: "Real Estate" },
  { value: "forex", label: "Forex" },
  { value: "business", label: "Business" },
]

export function getBudgetFromSavings(savings: SavingsRange): { min: number; max: number } {
  switch (savings) {
    case "lt_500":
      return { min: 1000, max: 2000 }
    case "500_2000":
      return { min: 1000, max: 3000 }
    case "2000_5000":
      return { min: 2000, max: 5000 }
    case "gt_5000":
      return { min: 5000, max: 10000 }
    default:
      return { min: 1000, max: 5000 }
  }
}

export function mapToleranceToRiskProfile(tolerance: RiskTolerance): RiskProfile {
  switch (tolerance) {
    case "low":
      return "conservative"
    case "high":
      return "aggressive"
    default:
      return "moderate"
  }
}

export function getReadableRiskTolerance(value: RiskTolerance): string {
  if (value === "low") return "Low"
  if (value === "high") return "High"
  return "Medium"
}

export function getReadableDuration(value: InvestmentDuration): string {
  if (value === "short") return "Short-term"
  if (value === "long") return "Long-term"
  return "Mid-term"
}
