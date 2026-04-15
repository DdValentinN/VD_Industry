-- Seed loukasbrz's portfolio with his own ETFs (distinct ISINs from Valentin)
-- Safe to re-run: DELETE is idempotent, INSERT ... ON CONFLICT DO NOTHING

-- 1. Remove any previously auto-seeded ETFs/transactions for loukasbrz
DELETE FROM "InvestTransaction"
WHERE "etfId" IN (
  SELECT id FROM "InvestETF" WHERE "userId" = 'loukasbrz'
);
DELETE FROM "InvestETF" WHERE "userId" = 'loukasbrz';

-- 2. Re-sync InvestETF sequence to avoid duplicate key errors
SELECT setval(
  pg_get_serial_sequence('"InvestETF"', 'id'),
  COALESCE((SELECT MAX(id) FROM "InvestETF"), 0) + 1,
  false
);

-- 3. Insert loukasbrz's ETFs
INSERT INTO "InvestETF" (isin, nom, "nomCourt", ticker, couleur, "userId")
VALUES
  ('FR001400U5Q4', 'MSCI World PEA', 'MSCI World', '', '#10b981', 'loukasbrz'),
  ('FR006174348',  'PEA Emergents Monde', 'PEA Emergents', '', '#a78bfa', 'loukasbrz');

-- 4. Re-sync InvestTransaction sequence to avoid duplicate key errors
SELECT setval(
  pg_get_serial_sequence('"InvestTransaction"', 'id'),
  COALESCE((SELECT MAX(id) FROM "InvestTransaction"), 0) + 1,
  false
);

-- 5. Insert initial transactions
INSERT INTO "InvestTransaction" ("etfId", type, quantite, prix, date, notes)
SELECT id, 'achat', 5, 45.00, '2026-01-01 00:00:00'::timestamp, 'Position initiale'
FROM "InvestETF"
WHERE "userId" = 'loukasbrz' AND isin = 'FR001400U5Q4';

INSERT INTO "InvestTransaction" ("etfId", type, quantite, prix, date, notes)
SELECT id, 'achat', 1, 30.00, '2026-01-01 00:00:00'::timestamp, 'Position initiale'
FROM "InvestETF"
WHERE "userId" = 'loukasbrz' AND isin = 'FR006174348';

-- 6. Ensure loukasbrz has a Plan DCA
SELECT setval(
  pg_get_serial_sequence('"InvestPlan"', 'id'),
  COALESCE((SELECT MAX(id) FROM "InvestPlan"), 0) + 1,
  false
);

INSERT INTO "InvestPlan" ("userId", "montantS1", "montantS2", "montantS3", "montantS4", "partsEmergS4", "partsStorxxS4", "cycleWeek")
VALUES ('loukasbrz', 100, 100, 100, 150, 2, 2, 1)
ON CONFLICT ("userId") DO NOTHING;
