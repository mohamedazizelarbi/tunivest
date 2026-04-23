-- ============================================================================
-- 04_queries_examples.sql
-- Objectif:
--   Requetes SQL d interrogation et modification pour usage app (PHP/.NET/JS).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. Lecture investissements actifs
-- ---------------------------------------------------------------------------
SELECT id,
       name,
       category,
       min_amount,
       expected_return,
       risk_level,
       duration_months
FROM public.investments
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- ---------------------------------------------------------------------------
-- B. Lecture portefeuille utilisateur
-- ---------------------------------------------------------------------------
SELECT p.id,
       p.user_id,
       i.name AS investment_name,
       p.amount,
       p.purchase_price,
       p.current_value,
       p.purchased_at
FROM public.portfolio p
JOIN public.investments i ON i.id = p.investment_id
WHERE p.user_id = :user_id
ORDER BY p.purchased_at DESC;

-- ---------------------------------------------------------------------------
-- C. Lecture recommandations
-- ---------------------------------------------------------------------------
SELECT r.id,
       r.score,
       r.reason,
       i.name AS investment_name
FROM public.recommendations r
JOIN public.investments i ON i.id = r.investment_id
WHERE r.user_id = :user_id
  AND r.is_viewed = FALSE
ORDER BY r.score DESC;

-- ---------------------------------------------------------------------------
-- D. Creation transaction
-- ---------------------------------------------------------------------------
INSERT INTO public.transactions (user_id, investment_id, type, amount, price_per_unit, total_value)
VALUES (:user_id, :investment_id, :type, :amount, :price_per_unit, (:amount * :price_per_unit));

-- ---------------------------------------------------------------------------
-- E. Modification profil
-- ---------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = :full_name,
    phone = :phone,
    salary = :salary,
    updated_at = NOW()
WHERE id = :user_id;

-- ---------------------------------------------------------------------------
-- F. Suppression simulation
-- ---------------------------------------------------------------------------
DELETE FROM public.simulations
WHERE id = :simulation_id
  AND user_id = :user_id;

-- ---------------------------------------------------------------------------
-- G. Upsert portfolio
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio (user_id, investment_id, amount, purchase_price, current_value)
VALUES (:user_id, :investment_id, :amount, :purchase_price, (:amount * :purchase_price))
ON CONFLICT (user_id, investment_id)
DO UPDATE SET
  amount = public.portfolio.amount + EXCLUDED.amount,
  purchase_price = EXCLUDED.purchase_price,
  current_value = public.portfolio.current_value + EXCLUDED.current_value,
  updated_at = NOW();

-- ---------------------------------------------------------------------------
-- H. Reporting global
-- ---------------------------------------------------------------------------
SELECT p.id AS user_id,
       p.email,
       COUNT(po.id) AS positions_count,
       COALESCE(SUM(po.current_value), 0) AS total_portfolio,
       COALESCE(AVG(i.expected_return), 0) AS avg_expected_return
FROM public.profiles p
LEFT JOIN public.portfolio po ON po.user_id = p.id
LEFT JOIN public.investments i ON i.id = po.investment_id
GROUP BY p.id, p.email
ORDER BY total_portfolio DESC;
