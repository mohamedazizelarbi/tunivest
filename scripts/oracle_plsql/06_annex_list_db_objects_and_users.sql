-- ============================================================================
-- 06_annex_list_db_objects_and_users.sql
-- Objectif:
--   Lister les objets BD du schema et afficher les utilisateurs.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. Objets du schema courant (table, view, procedure, function, trigger...)
-- ---------------------------------------------------------------------------
SELECT object_type,
       object_name,
       status,
       created,
       last_ddl_time
FROM user_objects
ORDER BY object_type, object_name;

-- ---------------------------------------------------------------------------
-- B. Contraintes
-- ---------------------------------------------------------------------------
SELECT constraint_name,
       table_name,
       constraint_type,
       status
FROM user_constraints
ORDER BY table_name, constraint_name;

-- ---------------------------------------------------------------------------
-- C. Index
-- ---------------------------------------------------------------------------
SELECT index_name,
       table_name,
       uniqueness,
       status
FROM user_indexes
ORDER BY table_name, index_name;

-- ---------------------------------------------------------------------------
-- D. Triggers
-- ---------------------------------------------------------------------------
SELECT trigger_name,
       table_name,
       triggering_event,
       status
FROM user_triggers
ORDER BY table_name, trigger_name;

-- ---------------------------------------------------------------------------
-- E. Utilisateurs DB (necessite privilege SELECT_CATALOG_ROLE)
-- ---------------------------------------------------------------------------
SELECT username,
       account_status,
       default_tablespace,
       temporary_tablespace,
       created
FROM dba_users
WHERE username IN ('TUNIVEST_ADMIN', 'TUNIVEST_APP', 'TUNIVEST_REPORTER')
ORDER BY username;

-- ---------------------------------------------------------------------------
-- Fallback si DBA_USERS non accessible
-- ---------------------------------------------------------------------------
-- SELECT username FROM all_users ORDER BY username;
