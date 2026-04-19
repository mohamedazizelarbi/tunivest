-- ============================================================================
-- 06_annex_inventory.sql
-- Objectif:
--   Lister tous les objets BD du schema + utilisateurs/roles.
-- ============================================================================

-- A. Tables
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- B. Colonnes
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- C. Contraintes
SELECT tc.table_name,
       tc.constraint_name,
       tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- D. Fonctions/procedures
SELECT n.nspname AS schema_name,
       p.proname AS routine_name,
       p.prokind AS routine_kind
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- E. Triggers
SELECT event_object_table AS table_name,
       trigger_name,
       action_timing,
       event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- F. Policies RLS
SELECT schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- G. Utilisateurs/roles PostgreSQL
SELECT rolname,
       rolsuper,
       rolinherit,
       rolcreaterole,
       rolcreatedb,
       rolcanlogin
FROM pg_roles
ORDER BY rolname;
