-- ============================================================================
-- 01_create_users_roles_privileges.sql
-- Objectif:
--   1) Creer les roles applicatifs
--   2) Creer les utilisateurs BD
--   3) Attribuer les privileges necessaires
--
-- IMPORTANT:
-- - Executer ce script avec un compte DBA (ex: SYS, SYSTEM)
-- - Adapter les mots de passe et tablespaces selon votre environnement Oracle
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Optional cleanup (decommenter si vous voulez reinitialiser)
-- ---------------------------------------------------------------------------
-- DROP USER tunivest_admin CASCADE;
-- DROP USER tunivest_app CASCADE;
-- DROP USER tunivest_reporter CASCADE;
-- DROP ROLE tunivest_rw_role;
-- DROP ROLE tunivest_ro_role;

-- ---------------------------------------------------------------------------
-- Creation des roles
-- ---------------------------------------------------------------------------
CREATE ROLE tunivest_rw_role;
CREATE ROLE tunivest_ro_role;

-- Role lecture seule pour reporting
GRANT CREATE SESSION TO tunivest_ro_role;

-- Role lecture/ecriture pour application
GRANT CREATE SESSION TO tunivest_rw_role;

-- ---------------------------------------------------------------------------
-- Creation des utilisateurs
-- ---------------------------------------------------------------------------
CREATE USER tunivest_admin IDENTIFIED BY "Admin#2026"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

CREATE USER tunivest_app IDENTIFIED BY "App#2026"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA 500M ON USERS;

CREATE USER tunivest_reporter IDENTIFIED BY "Report#2026"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA 100M ON USERS;

-- ---------------------------------------------------------------------------
-- Privileges schema owner (tunivest_admin)
-- ---------------------------------------------------------------------------
GRANT CREATE SESSION TO tunivest_admin;
GRANT CREATE TABLE TO tunivest_admin;
GRANT CREATE VIEW TO tunivest_admin;
GRANT CREATE SEQUENCE TO tunivest_admin;
GRANT CREATE PROCEDURE TO tunivest_admin;
GRANT CREATE TRIGGER TO tunivest_admin;
GRANT CREATE TYPE TO tunivest_admin;
GRANT CREATE SYNONYM TO tunivest_admin;

-- ---------------------------------------------------------------------------
-- Role assignment
-- ---------------------------------------------------------------------------
GRANT tunivest_rw_role TO tunivest_app;
GRANT tunivest_ro_role TO tunivest_reporter;

-- ---------------------------------------------------------------------------
-- Notes:
-- - Les droits objets (SELECT/INSERT/UPDATE/DELETE sur tables) sont attribues
--   apres creation des tables dans le script 02.
-- - Vous pouvez imposer des profils de mot de passe avec ALTER PROFILE si besoin.
-- ---------------------------------------------------------------------------
