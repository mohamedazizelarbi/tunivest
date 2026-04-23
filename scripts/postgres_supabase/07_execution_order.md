# Ordre execution - Pack PostgreSQL/Supabase

1. scripts/postgres_supabase/01_create_schema.sql
2. scripts/postgres_supabase/08_user_profile_onboarding.sql
3. scripts/postgres_supabase/09_portfolio_deal_tracking.sql
4. scripts/postgres_supabase/02_security_policies.sql
5. scripts/postgres_supabase/03_seed_data.sql
6. scripts/postgres_supabase/05_plpgsql_functions_procedures_triggers.sql
7. scripts/postgres_supabase/04_queries_examples.sql
8. scripts/postgres_supabase/06_annex_inventory.sql

## Notes
- Executer via Supabase SQL Editor ou psql sur la meme base que NEXT_PUBLIC_SUPABASE_URL.
- Le script 01 cree la table public.investments attendue par /investments.
- Le script 03 injecte des donnees pour eviter page vide.
