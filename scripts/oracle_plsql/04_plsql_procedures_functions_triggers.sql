-- ============================================================================
-- 04_plsql_procedures_functions_triggers.sql
-- Objectif:
--   Creer procedures, fonctions, curseurs (implicites/explicites) et triggers.
--
-- IMPORTANT:
-- - Executer ce script connecte en tant que: tunivest_admin
-- - Activer DBMS_OUTPUT pour voir les messages des blocs de test
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Fonction: calculer profil de risque a partir du salaire
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_compute_risk_profile (
  p_salary IN NUMBER
) RETURN VARCHAR2
IS
  v_profile VARCHAR2(20);
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
/

-- ---------------------------------------------------------------------------
-- Procedure: creation d investissement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_create_investment (
  p_name                IN investments.name%TYPE,
  p_description         IN investments.description%TYPE,
  p_category            IN investments.category%TYPE,
  p_min_amount          IN investments.min_amount%TYPE,
  p_expected_return_pct IN investments.expected_return_pct%TYPE,
  p_risk_level          IN investments.risk_level%TYPE,
  p_duration_months     IN investments.duration_months%TYPE
)
IS
BEGIN
  INSERT INTO investments (
    name,
    description,
    category,
    min_amount,
    expected_return_pct,
    risk_level,
    duration_months,
    is_active,
    created_at
  ) VALUES (
    p_name,
    p_description,
    p_category,
    p_min_amount,
    p_expected_return_pct,
    p_risk_level,
    p_duration_months,
    1,
    CURRENT_TIMESTAMP
  );

  -- Curseur implicite: SQL%ROWCOUNT apres INSERT
  DBMS_OUTPUT.PUT_LINE('Insertion investissement OK. Lignes impactees=' || SQL%ROWCOUNT);
END;
/

-- ---------------------------------------------------------------------------
-- Fonction: valeur totale du portefeuille d un utilisateur
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_portfolio_total_value (
  p_user_id IN app_users.user_id%TYPE
) RETURN NUMBER
IS
  v_total NUMBER(18,2);
BEGIN
  SELECT NVL(SUM(current_value), 0)
    INTO v_total
    FROM portfolio
   WHERE user_id = p_user_id;

  RETURN v_total;
END;
/

-- ---------------------------------------------------------------------------
-- Procedure: regenerer recommandations d un utilisateur
-- - Exemple de curseur explicite
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_refresh_recommendations (
  p_user_id IN app_users.user_id%TYPE
)
IS
  CURSOR c_investments IS
    SELECT investment_id,
           expected_return_pct,
           risk_level,
           category
      FROM investments
     WHERE is_active = 1;

  v_user_risk app_users.risk_profile%TYPE;
  v_score     NUMBER(5,2);
  v_reason    VARCHAR2(500);
BEGIN
  SELECT risk_profile
    INTO v_user_risk
    FROM app_users
   WHERE user_id = p_user_id;

  DELETE FROM recommendations
   WHERE user_id = p_user_id;

  -- SQL%ROWCOUNT ici est un curseur implicite sur DELETE
  DBMS_OUTPUT.PUT_LINE('Anciennes recommandations supprimees=' || SQL%ROWCOUNT);

  FOR rec IN c_investments LOOP
    -- Regle simple de scoring selon risque utilisateur
    v_score := rec.expected_return_pct * 4;

    IF v_user_risk = 'conservative' THEN
      v_score := v_score - (rec.risk_level * 5);
    ELSIF v_user_risk = 'moderate' THEN
      v_score := v_score - (ABS(rec.risk_level - 5) * 3);
    ELSE
      v_score := v_score + (rec.risk_level * 2);
    END IF;

    v_score := LEAST(GREATEST(v_score, 0), 100);

    v_reason := 'Score calcule par PL/SQL selon profil de risque et rendement attendu.';

    INSERT INTO recommendations (user_id, investment_id, score, reason, is_viewed, created_at)
    VALUES (p_user_id, rec.investment_id, v_score, v_reason, 0, CURRENT_TIMESTAMP);
  END LOOP;
END;
/

-- ---------------------------------------------------------------------------
-- Trigger: app_users avant INSERT/UPDATE
-- - Met a jour updated_at
-- - Calcule automatiquement risk_profile selon salary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_app_users_biu
BEFORE INSERT OR UPDATE OF salary ON app_users
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;

  IF :NEW.salary IS NOT NULL THEN
    :NEW.risk_profile := fn_compute_risk_profile(:NEW.salary);
  END IF;
END;
/

-- ---------------------------------------------------------------------------
-- Trigger: transactions avant INSERT/UPDATE
-- - Calcule total_value automatiquement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_transactions_biu
BEFORE INSERT OR UPDATE OF units, price_per_unit ON transactions
FOR EACH ROW
BEGIN
  :NEW.total_value := NVL(:NEW.units, 0) * NVL(:NEW.price_per_unit, 0);
END;
/

-- ---------------------------------------------------------------------------
-- Table d audit + trigger d audit portfolio
-- ---------------------------------------------------------------------------
CREATE TABLE portfolio_audit (
  audit_id              NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  portfolio_id          NUMBER,
  old_current_value     NUMBER(14,2),
  new_current_value     NUMBER(14,2),
  changed_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by            VARCHAR2(120)
);

CREATE OR REPLACE TRIGGER trg_portfolio_audit
AFTER UPDATE OF current_value ON portfolio
FOR EACH ROW
BEGIN
  INSERT INTO portfolio_audit (
    portfolio_id,
    old_current_value,
    new_current_value,
    changed_at,
    changed_by
  ) VALUES (
    :OLD.portfolio_id,
    :OLD.current_value,
    :NEW.current_value,
    CURRENT_TIMESTAMP,
    SYS_CONTEXT('USERENV', 'SESSION_USER')
  );
END;
/
