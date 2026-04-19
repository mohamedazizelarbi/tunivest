-- ============================================================================
-- 05_plpgsql_functions_procedures_triggers.sql
-- Objectif:
--   Ajouter logique metier PL/pgSQL: fonctions, procedure, curseurs, triggers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Fonction: calcul profil de risque a partir du salaire
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_compute_risk_profile(p_salary NUMERIC)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile TEXT;
BEGIN
  IF p_salary IS NULL OR p_salary < 1500 THEN
    v_profile := 'conservative';
  ELSIF p_salary < 5000 THEN
    v_profile := 'moderate';
  ELSE
    v_profile := 'aggressive';
  END IF;

  RETURN v_profile;
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: auto update risk_profile quand salary change
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_profiles_salary_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.risk_profile := public.fn_compute_risk_profile(NEW.salary);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_salary_risk ON public.profiles;
CREATE TRIGGER trg_profiles_salary_risk
BEFORE INSERT OR UPDATE OF salary ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trg_profiles_salary_risk();

-- ---------------------------------------------------------------------------
-- Trigger: auto calcul total_value sur transactions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_transactions_total_value()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_value := COALESCE(NEW.amount, 0) * COALESCE(NEW.price_per_unit, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transactions_total_value ON public.transactions;
CREATE TRIGGER trg_transactions_total_value
BEFORE INSERT OR UPDATE OF amount, price_per_unit ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trg_transactions_total_value();

-- ---------------------------------------------------------------------------
-- Fonction: valeur totale portefeuille utilisateur
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_portfolio_total_value(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(current_value), 0)
    INTO v_total
    FROM public.portfolio
   WHERE user_id = p_user_id;

  RETURN v_total;
END;
$$;

-- ---------------------------------------------------------------------------
-- Procedure: regeneration recommandations (logique simple)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE public.sp_refresh_recommendations(p_user_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_risk TEXT;
  v_score NUMERIC;
  rec RECORD;
BEGIN
  SELECT risk_profile INTO v_user_risk
  FROM public.profiles
  WHERE id = p_user_id;

  DELETE FROM public.recommendations
  WHERE user_id = p_user_id;

  -- Note "implicite": GET DIAGNOSTICS recupere le nombre de lignes impactees
  -- de la derniere instruction SQL executee.
  RAISE NOTICE 'Anciennes recommandations supprimees=%', FOUND;

  -- Parcours des investissements actifs (equivalent curseur explicite via FOR)
  FOR rec IN
    SELECT id, expected_return, risk_level
    FROM public.investments
    WHERE is_active = TRUE
  LOOP
    v_score := rec.expected_return * 4;

    IF v_user_risk = 'conservative' THEN
      v_score := v_score - (rec.risk_level * 5);
    ELSIF v_user_risk = 'moderate' THEN
      v_score := v_score - (ABS(rec.risk_level - 5) * 3);
    ELSE
      v_score := v_score + (rec.risk_level * 2);
    END IF;

    v_score := LEAST(GREATEST(v_score, 0), 100);

    INSERT INTO public.recommendations (user_id, investment_id, score, reason, is_viewed)
    VALUES (
      p_user_id,
      rec.id,
      v_score,
      'Score calcule via PLpgSQL selon profil risque et expected_return',
      FALSE
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Exemple curseur explicite PostgreSQL avec REFCURSOR
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_open_active_investments_cursor()
RETURNS REFCURSOR
LANGUAGE plpgsql
AS $$
DECLARE
  c_active REFCURSOR := 'c_active_investments';
BEGIN
  OPEN c_active FOR
    SELECT id, name, expected_return, risk_level
    FROM public.investments
    WHERE is_active = TRUE
    ORDER BY expected_return DESC;

  RETURN c_active;
END;
$$;

-- ---------------------------------------------------------------------------
-- Table audit + trigger portfolio
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_audit (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL,
  old_current_value NUMERIC(14,2),
  new_current_value NUMERIC(14,2),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID
);

CREATE OR REPLACE FUNCTION public.trg_portfolio_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.portfolio_audit (
    portfolio_id,
    old_current_value,
    new_current_value,
    changed_at,
    changed_by
  ) VALUES (
    OLD.id,
    OLD.current_value,
    NEW.current_value,
    NOW(),
    auth.uid()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portfolio_audit ON public.portfolio;
CREATE TRIGGER trg_portfolio_audit
AFTER UPDATE OF current_value ON public.portfolio
FOR EACH ROW
WHEN (OLD.current_value IS DISTINCT FROM NEW.current_value)
EXECUTE FUNCTION public.trg_portfolio_audit();
