-- ============================================================================
-- 08_user_profile_onboarding.sql
-- Objectif:
--   Ajouter la table user_profile pour stocker le parcours onboarding investisseur.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profile (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_type TEXT NOT NULL CHECK (personality_type IN ('analyst', 'diplomat', 'sentinel', 'explorer')),
  age_range TEXT NOT NULL CHECK (age_range IN ('under_18', '18_25', '26_35', '36_50', '50_plus')),
  employment_status TEXT NOT NULL CHECK (employment_status IN ('student', 'employed', 'self_employed', 'unemployed')),
  monthly_income_range TEXT NOT NULL CHECK (monthly_income_range IN ('lt_1000', '1000_3000', 'gt_3000')),
  savings_range TEXT NOT NULL CHECK (savings_range IN ('lt_500', '500_2000', '2000_5000', 'gt_5000')),
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investment_knowledge TEXT NOT NULL CHECK (investment_knowledge IN ('beginner', 'intermediate', 'advanced')),
  primary_goal TEXT NOT NULL CHECK (primary_goal IN ('preserve_money', 'grow_steadily', 'maximize_profits')),
  investment_duration TEXT NOT NULL CHECK (investment_duration IN ('short', 'medium', 'long')),
  preferences TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  budget_min_tnd NUMERIC(12,2) NOT NULL DEFAULT 1000,
  budget_max_tnd NUMERIC(12,2) NOT NULL DEFAULT 5000,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (budget_min_tnd <= budget_max_tnd),
  CHECK (preferences <@ ARRAY['stocks', 'crypto', 'real_estate', 'forex', 'business']::TEXT[])
);

CREATE INDEX IF NOT EXISTS idx_user_profile_completed_at ON public.user_profile(completed_at DESC);

DROP TRIGGER IF EXISTS trg_user_profile_set_updated_at ON public.user_profile;
CREATE TRIGGER trg_user_profile_set_updated_at
BEFORE UPDATE ON public.user_profile
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
