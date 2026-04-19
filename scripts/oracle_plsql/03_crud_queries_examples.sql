-- ============================================================================
-- 03_crud_queries_examples.sql
-- Objectif:
--   Fournir les requetes d interrogation et de modification
--   (utilisables dans applications PHP, .NET ou autres clients SQL).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. INSERT (creation)
-- ---------------------------------------------------------------------------
INSERT INTO app_users (email, full_name, phone, salary, risk_profile, user_role)
VALUES (:p_email, :p_full_name, :p_phone, :p_salary, :p_risk_profile, :p_user_role);

INSERT INTO investments (name, description, category, min_amount, expected_return_pct, risk_level, duration_months, is_active)
VALUES (:p_name, :p_description, :p_category, :p_min_amount, :p_expected_return, :p_risk_level, :p_duration_months, :p_is_active);

-- ---------------------------------------------------------------------------
-- B. SELECT (interrogation)
-- ---------------------------------------------------------------------------
-- Liste des investissements actifs tries par date de creation
SELECT investment_id,
       name,
       category,
       min_amount,
       expected_return_pct,
       risk_level,
       duration_months
FROM investments
WHERE is_active = 1
ORDER BY created_at DESC;

-- Portfolio d un utilisateur
SELECT p.portfolio_id,
       p.user_id,
       i.name AS investment_name,
       p.units,
       p.purchase_price,
       p.current_value,
       p.purchased_at
FROM portfolio p
JOIN investments i ON i.investment_id = p.investment_id
WHERE p.user_id = :p_user_id
ORDER BY p.purchased_at DESC;

-- Recommandations non vues pour un utilisateur
SELECT r.recommendation_id,
       r.score,
       r.reason,
       i.name AS investment_name,
       i.category
FROM recommendations r
JOIN investments i ON i.investment_id = r.investment_id
WHERE r.user_id = :p_user_id
  AND r.is_viewed = 0
ORDER BY r.score DESC;

-- ---------------------------------------------------------------------------
-- C. UPDATE (modification)
-- ---------------------------------------------------------------------------
UPDATE app_users
SET salary = :p_salary,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = :p_user_id;

UPDATE recommendations
SET is_viewed = 1
WHERE recommendation_id = :p_recommendation_id;

UPDATE portfolio
SET current_value = :p_current_value,
    updated_at = CURRENT_TIMESTAMP
WHERE portfolio_id = :p_portfolio_id;

-- ---------------------------------------------------------------------------
-- D. DELETE (suppression)
-- ---------------------------------------------------------------------------
DELETE FROM simulations
WHERE simulation_id = :p_simulation_id
  AND user_id = :p_user_id;

-- ---------------------------------------------------------------------------
-- E. UPSERT (MERGE)
-- ---------------------------------------------------------------------------
MERGE INTO portfolio p
USING (
  SELECT :p_user_id AS user_id,
         :p_investment_id AS investment_id,
         :p_units AS units,
         :p_purchase_price AS purchase_price
  FROM dual
) src
ON (p.user_id = src.user_id AND p.investment_id = src.investment_id)
WHEN MATCHED THEN
  UPDATE SET p.units = p.units + src.units,
             p.purchase_price = src.purchase_price,
             p.updated_at = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
  INSERT (user_id, investment_id, units, purchase_price, current_value, purchased_at, updated_at)
  VALUES (src.user_id, src.investment_id, src.units, src.purchase_price, src.units * src.purchase_price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------------------------------------------------------------------------
-- F. Requete analytique (reporting)
-- ---------------------------------------------------------------------------
SELECT u.user_id,
       u.email,
       COUNT(p.portfolio_id) AS nb_positions,
       SUM(p.current_value) AS portefeuille_total,
       AVG(i.expected_return_pct) AS rendement_moyen_theorique
FROM app_users u
LEFT JOIN portfolio p ON p.user_id = u.user_id
LEFT JOIN investments i ON i.investment_id = p.investment_id
GROUP BY u.user_id, u.email
ORDER BY portefeuille_total DESC NULLS LAST;
