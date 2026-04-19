-- ============================================================================
-- 03_seed_data.sql
-- Objectif:
--   Injecter des donnees de test coherentes avec le front.
-- ============================================================================

INSERT INTO public.investments (
  name,
  description,
  category,
  min_amount,
  expected_return,
  risk_level,
  duration_months,
  is_active
)
VALUES
  ('Coastal Ag-Tech Hub', 'Scaling olive oil processing units in Sfax with export-focused strategy.', 'funds', 2000, 14.5, 5, 24, TRUE),
  ('La Marsa Residential', 'Fractional ownership in premium rental units with occupancy resilience.', 'real_estate', 5000, 8.2, 3, 36, TRUE),
  ('Southern Solar Farm', 'Infrastructure bond for utility-scale solar installations backed by long-term contracts.', 'bonds', 850, 11.0, 4, 30, TRUE),
  ('NeoBank Tunis', 'Series A fintech round targeting digital payments and embedded finance.', 'stocks', 15000, 35.0, 9, 48, TRUE),
  ('Djerba Boutique Resort', 'Heritage hotel renovation project with tourism recovery upside.', 'real_estate', 3500, 9.5, 6, 30, TRUE),
  ('Med Startup Basket', 'Diversified startup basket focused on B2B SaaS and logistics.', 'funds', 1200, 16.0, 7, 24, TRUE);

-- Historique market_data minimal
INSERT INTO public.market_data (investment_id, price, change_percent, volume, recorded_at)
SELECT i.id,
       100 + (random() * 20),
       (random() * 2) - 1,
       100000 + (random() * 500000),
       NOW() - (gs.i || ' days')::INTERVAL
FROM public.investments i
CROSS JOIN generate_series(0, 4) AS gs(i);
