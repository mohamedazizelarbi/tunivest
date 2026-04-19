-- ============================================================================
-- 02_security_policies.sql
-- Objectif:
--   Gerer les privileges d acces avec RLS (Row Level Security) sur Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper admin function (evite recursion RLS sur public.profiles)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_user(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT p.is_admin
      FROM public.profiles p
      WHERE p.id = uid
      LIMIT 1
    ),
    FALSE
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Activation RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Profiles policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin_user())
WITH CHECK (auth.uid() = id OR public.is_admin_user());

-- ---------------------------------------------------------------------------
-- Investments policies (lecture publique, ecriture admin)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "investments_public_read" ON public.investments;
CREATE POLICY "investments_public_read"
ON public.investments FOR SELECT
TO anon, authenticated
USING (TRUE);

DROP POLICY IF EXISTS "investments_admin_write" ON public.investments;
CREATE POLICY "investments_admin_write"
ON public.investments FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- Portfolio policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "portfolio_select_own_or_admin" ON public.portfolio;
CREATE POLICY "portfolio_select_own_or_admin"
ON public.portfolio FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "portfolio_modify_own" ON public.portfolio;
CREATE POLICY "portfolio_modify_own"
ON public.portfolio FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Recommendations policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "recommendations_select_own_or_admin" ON public.recommendations;
CREATE POLICY "recommendations_select_own_or_admin"
ON public.recommendations FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "recommendations_admin_write" ON public.recommendations;
CREATE POLICY "recommendations_admin_write"
ON public.recommendations FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- Transactions policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_own_or_admin" ON public.transactions;
CREATE POLICY "transactions_select_own_or_admin"
ON public.transactions FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "transactions_modify_own" ON public.transactions;
CREATE POLICY "transactions_modify_own"
ON public.transactions FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Market data policies (lecture publique, ecriture admin)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "market_data_public_read" ON public.market_data;
CREATE POLICY "market_data_public_read"
ON public.market_data FOR SELECT
TO anon, authenticated
USING (TRUE);

DROP POLICY IF EXISTS "market_data_admin_write" ON public.market_data;
CREATE POLICY "market_data_admin_write"
ON public.market_data FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ---------------------------------------------------------------------------
-- Simulations policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "simulations_select_own_or_admin" ON public.simulations;
CREATE POLICY "simulations_select_own_or_admin"
ON public.simulations FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "simulations_modify_own" ON public.simulations;
CREATE POLICY "simulations_modify_own"
ON public.simulations FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- User profile onboarding policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_profile_select_own_or_admin" ON public.user_profile;
CREATE POLICY "user_profile_select_own_or_admin"
ON public.user_profile FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "user_profile_insert_own" ON public.user_profile;
CREATE POLICY "user_profile_insert_own"
ON public.user_profile FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_profile_update_own_or_admin" ON public.user_profile;
CREATE POLICY "user_profile_update_own_or_admin"
ON public.user_profile FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin_user())
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());
