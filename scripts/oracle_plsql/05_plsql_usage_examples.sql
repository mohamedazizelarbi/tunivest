-- ============================================================================
-- 05_plsql_usage_examples.sql
-- Objectif:
--   Montrer comment interroger la base en PL/SQL avec commentaires pedagogiques.
-- ============================================================================

SET SERVEROUTPUT ON;

-- ---------------------------------------------------------------------------
-- Exemple 1: bloc PL/SQL anonyme + curseur implicite
-- ---------------------------------------------------------------------------
DECLARE
  v_user_id app_users.user_id%TYPE := :p_user_id;
BEGIN
  -- On marque toutes les recommandations comme vues pour cet utilisateur.
  UPDATE recommendations
     SET is_viewed = 1
   WHERE user_id = v_user_id
     AND is_viewed = 0;

  -- SQL%ROWCOUNT est disponible automatiquement (curseur implicite Oracle).
  DBMS_OUTPUT.PUT_LINE('Recommandations marquees comme vues=' || SQL%ROWCOUNT);
END;
/

-- ---------------------------------------------------------------------------
-- Exemple 2: curseur explicite pour parcourir investissements actifs
-- ---------------------------------------------------------------------------
DECLARE
  CURSOR c_active_investments IS
    SELECT investment_id, name, expected_return_pct, risk_level
      FROM investments
     WHERE is_active = 1
     ORDER BY expected_return_pct DESC;

  v_rec c_active_investments%ROWTYPE;
BEGIN
  OPEN c_active_investments;
  LOOP
    FETCH c_active_investments INTO v_rec;
    EXIT WHEN c_active_investments%NOTFOUND;

    DBMS_OUTPUT.PUT_LINE(
      'ID=' || v_rec.investment_id ||
      ' | Name=' || v_rec.name ||
      ' | Return=' || v_rec.expected_return_pct ||
      ' | Risk=' || v_rec.risk_level
    );
  END LOOP;
  CLOSE c_active_investments;
END;
/

-- ---------------------------------------------------------------------------
-- Exemple 3: appel procedure + fonction metier
-- ---------------------------------------------------------------------------
DECLARE
  v_user_id NUMBER := :p_user_id;
  v_total   NUMBER;
BEGIN
  -- Regenerer les recommandations d un utilisateur.
  sp_refresh_recommendations(v_user_id);

  -- Lire la valeur de portefeuille via fonction PL/SQL.
  v_total := fn_portfolio_total_value(v_user_id);

  DBMS_OUTPUT.PUT_LINE('Valeur totale portefeuille=' || v_total);
END;
/
