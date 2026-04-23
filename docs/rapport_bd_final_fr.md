# Rapport Base de Donnees - Projet TuniVest

## Introduction
Ce document presente la conception et l implementation de la base de donnees du projet TuniVest selon la roadmap academique demandee.

Le travail couvre:
- la creation des utilisateurs BD, tables et privileges,
- les requetes SQL d interrogation et de modification,
- la programmation metier (procedures, fonctions, curseurs, triggers),
- une annexe de tous les objets BD du schema.

Deux versions sont fournies:
- version Oracle PL/SQL (orientation academique),
- version PostgreSQL/Supabase (orientation application Next.js actuelle).

## 1) Creation de la base: utilisateurs, tables, privileges

### 1.1 Version Oracle
Scripts utilises:
- scripts/oracle_plsql/01_create_users_roles_privileges.sql
- scripts/oracle_plsql/02_create_schema_tables.sql

Description:
- creation de 3 utilisateurs BD: owner schema, compte applicatif, compte reporting,
- creation de roles lecture/ecriture et lecture seule,
- attribution des droits DDL puis droits objets (SELECT/INSERT/UPDATE/DELETE),
- creation des tables metier avec PK/FK/CHECK/UNIQUE,
- creation d index pour les requetes frequentes.

### 1.2 Version PostgreSQL/Supabase
Scripts utilises:
- scripts/postgres_supabase/01_create_schema.sql
- scripts/postgres_supabase/02_security_policies.sql

Description:
- creation des tables principales (profiles, investments, portfolio, recommendations, transactions, market_data, simulations),
- alignement strict avec les champs utilises dans l application,
- activation RLS (Row Level Security) et policies par role/fonction,
- lecture publique controlee pour les donnees de marche,
- ecriture reservee aux administrateurs pour les objets sensibles.

## 2) Requetes d interrogation et de modification

### 2.1 Version Oracle
Script:
- scripts/oracle_plsql/03_crud_queries_examples.sql

Contenu:
- INSERT de nouveaux utilisateurs et investissements,
- SELECT portefeuille utilisateur,
- SELECT recommandations non vues,
- UPDATE profil/recommandation/valorisation,
- DELETE simulations,
- MERGE (upsert) portefeuille,
- requete analytique globale pour reporting.

### 2.2 Version PostgreSQL/Supabase
Script:
- scripts/postgres_supabase/04_queries_examples.sql

Contenu:
- lecture des investissements actifs,
- lecture du portefeuille par utilisateur,
- lecture recommandations personnalisees,
- insertion transaction,
- mise a jour profil,
- suppression simulation,
- upsert portefeuille via ON CONFLICT,
- reporting global agregat.

## 3) Procedures, fonctions, curseurs implicites/explicites, triggers

### 3.1 Version Oracle PL/SQL
Script:
- scripts/oracle_plsql/04_plsql_procedures_functions_triggers.sql

Objets implementes:
- fonction fn_compute_risk_profile,
- fonction fn_portfolio_total_value,
- procedure sp_create_investment,
- procedure sp_refresh_recommendations,
- usage curseur implicite (SQL%ROWCOUNT),
- usage curseur explicite (CURSOR + LOOP),
- trigger de calcul automatique du profil de risque,
- trigger de calcul total transaction,
- trigger d audit des changements de portefeuille.

### 3.2 Version PostgreSQL PLpgSQL
Script:
- scripts/postgres_supabase/05_plpgsql_functions_procedures_triggers.sql

Objets implementes:
- fonction fn_compute_risk_profile,
- fonction fn_portfolio_total_value,
- procedure sp_refresh_recommendations,
- trigger profils (salary -> risk_profile),
- trigger transactions (recalcul total_value),
- fonction de curseur explicite REFCURSOR,
- trigger d audit portefeuille.

## 4) Utilisation PL/SQL avec commentaires explicatifs

### 4.1 Oracle
Script:
- scripts/oracle_plsql/05_plsql_usage_examples.sql

Elements montres:
- bloc anonyme commente,
- mise en oeuvre curseur implicite et explicite,
- appel procedure + fonction,
- DBMS_OUTPUT pour traces de verification.

### 4.2 PostgreSQL
Scripts:
- scripts/postgres_supabase/05_plpgsql_functions_procedures_triggers.sql
- scripts/postgres_supabase/04_queries_examples.sql

Elements montres:
- fonctions/procedure PLpgSQL commentees,
- logique metier au niveau base,
- traces RAISE NOTICE,
- requetes SQL parametrees reutilisables par les couches applicatives.

## 5) Description soignee des points precedents

### Choix de conception
- schema normalise, contraintes d integrite fortes,
- separation stricte des responsabilites entre couches metier,
- securite par RLS (PostgreSQL) ou roles/grants (Oracle),
- logique repetitive de calcul deplacee en BD (triggers/fonctions).

### Impact sur l application
- reduction des erreurs de coherence,
- simplification des requetes dans le front,
- meilleure maintenabilite,
- meilleure tracabilite via audit.

## 6) Annexe: enumeration des objets BD et utilisateurs

### Oracle
Script annexe:
- scripts/oracle_plsql/06_annex_list_db_objects_and_users.sql

Sorties attendues:
- tables, contraintes, index, triggers,
- procedures/fonctions,
- utilisateurs du schema.

### PostgreSQL/Supabase
Script annexe:
- scripts/postgres_supabase/06_annex_inventory.sql

Sorties attendues:
- tables/colonnes/contraintes,
- fonctions/procedures/triggers,
- policies RLS,
- roles PostgreSQL.

## Plan d execution recommande

### Oracle
1. scripts/oracle_plsql/01_create_users_roles_privileges.sql
2. scripts/oracle_plsql/02_create_schema_tables.sql
3. scripts/oracle_plsql/04_plsql_procedures_functions_triggers.sql
4. scripts/oracle_plsql/03_crud_queries_examples.sql
5. scripts/oracle_plsql/05_plsql_usage_examples.sql
6. scripts/oracle_plsql/06_annex_list_db_objects_and_users.sql

### PostgreSQL/Supabase
1. scripts/postgres_supabase/01_create_schema.sql
2. scripts/postgres_supabase/02_security_policies.sql
3. scripts/postgres_supabase/03_seed_data.sql
4. scripts/postgres_supabase/05_plpgsql_functions_procedures_triggers.sql
5. scripts/postgres_supabase/04_queries_examples.sql
6. scripts/postgres_supabase/06_annex_inventory.sql

## Conclusion
Le projet dispose maintenant:
- d un socle Oracle PL/SQL complet pour repondre aux exigences academiques,
- d un socle PostgreSQL/Supabase operationnel pour l application web,
- d une documentation structuree, exploitable directement dans le rapport final.

Ce double livrable permet de couvrir a la fois le cadre pedagogique et le besoin reel d integration avec le front actuel.
