-- ============================================================================
-- 09_portfolio_deal_tracking.sql
-- Objectif:
--   Permettre a chaque deal simule d'avoir son propre enregistrement portefeuille.
-- ============================================================================

ALTER TABLE public.portfolio
ADD COLUMN IF NOT EXISTS deal_key TEXT;

ALTER TABLE public.portfolio
ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE public.portfolio
ADD COLUMN IF NOT EXISTS deal_type TEXT;

UPDATE public.portfolio p
SET
  deal_key = COALESCE(p.deal_key, p.investment_id::TEXT),
  display_name = COALESCE(p.display_name, i.name),
  deal_type = COALESCE(
    p.deal_type,
    CASE i.category
      WHEN 'bonds' THEN 'Bonds'
      WHEN 'stocks' THEN 'Stocks'
      WHEN 'funds' THEN 'Funds'
      WHEN 'real_estate' THEN 'Real Estate'
      WHEN 'crypto' THEN 'Crypto'
      ELSE i.category
    END
  )
FROM public.investments i
WHERE p.investment_id = i.id;

ALTER TABLE public.portfolio
ALTER COLUMN deal_key SET NOT NULL;

ALTER TABLE public.portfolio
ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE public.portfolio
ALTER COLUMN deal_type SET NOT NULL;

ALTER TABLE public.portfolio
DROP CONSTRAINT IF EXISTS portfolio_user_id_investment_id_key;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'portfolio_user_id_investment_id_key'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.portfolio DROP CONSTRAINT portfolio_user_id_investment_id_key';
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_portfolio_user;
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_user_deal_key
  ON public.portfolio(user_id, deal_key);
