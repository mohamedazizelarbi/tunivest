# Rapport BD - Trame selon roadmap

## 1. Creation BD: utilisateurs, tables, privileges
- Script principal: scripts/oracle_plsql/01_create_users_roles_privileges.sql
- Script schema: scripts/oracle_plsql/02_create_schema_tables.sql
- A decrire dans le rapport:
  - Liste des utilisateurs crees et leur role
  - Strategie de privileges (lecture seule vs lecture/ecriture)
  - Justification des contraintes (PK, FK, CHECK, UNIQUE)

## 2. Requetes d interrogation et de modification
- Script: scripts/oracle_plsql/03_crud_queries_examples.sql
- A decrire dans le rapport:
  - Requetes SELECT principales (portfolio, recommandations, reporting)
  - Requetes INSERT/UPDATE/DELETE
  - Exemple MERGE (upsert)
  - Mapping vers les cas d usage de vos apps PHP/.NET

## 3. Procedures, fonctions, curseurs, triggers
- Script: scripts/oracle_plsql/04_plsql_procedures_functions_triggers.sql
- A decrire dans le rapport:
  - Procedure de creation investissement
  - Procedure de generation recommandations
  - Fonction calcul profil risque
  - Fonction valeur portefeuille
  - Trigger calcul automatique et trigger audit
  - Presence curseur implicite (SQL%ROWCOUNT) et explicite (CURSOR ... FOR/OPEN FETCH)

## 4. Utilisation PL/SQL commentee
- Script: scripts/oracle_plsql/05_plsql_usage_examples.sql
- A decrire dans le rapport:
  - Blocs anonymes et logique metier
  - Variables, controle de flux, DBMS_OUTPUT
  - Bonnes pratiques (commentaires, gestion des erreurs si ajoutee)

## 5. Redaction soignee dans le rapport
- Structure recommandee:
  - Introduction
  - Modele de donnees (MCD/MLD)
  - Securite et privileges
  - Requetes SQL
  - Programmabilite PL/SQL
  - Resultats de tests (captures output)
  - Conclusion

## 6. Annexe: tous les objets BD + utilisateurs
- Script annexe: scripts/oracle_plsql/06_annex_list_db_objects_and_users.sql
- A inclure dans l annexe:
  - Liste des tables
  - Liste des procedures/fonctions/triggers
  - Liste des index/contraintes
  - Liste des utilisateurs

## Ordre d execution conseille
1. 01_create_users_roles_privileges.sql
2. 02_create_schema_tables.sql
3. 04_plsql_procedures_functions_triggers.sql
4. 03_crud_queries_examples.sql
5. 05_plsql_usage_examples.sql
6. 06_annex_list_db_objects_and_users.sql

## Notes d adaptation
- Si vous utilisez PostgreSQL/Supabase en production web, garder ces scripts Oracle pour la partie academique PL/SQL.
- Si vous avez besoin, preparer un chapitre comparatif Oracle PL/SQL vs PostgreSQL PL/pgSQL.
