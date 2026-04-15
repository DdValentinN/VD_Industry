-- Add userId to Article (existing rows → "valentin")
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'valentin';

-- Add userId to InvestETF (existing rows → "valentin")
-- First drop the old @unique on isin alone, then add composite unique
ALTER TABLE "InvestETF" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'valentin';
ALTER TABLE "InvestETF" DROP CONSTRAINT IF EXISTS "InvestETF_isin_key";
ALTER TABLE "InvestETF" ADD CONSTRAINT "InvestETF_isin_userId_key" UNIQUE ("isin", "userId");

-- Change InvestPlan from singleton (id=1) to per-user
-- Add userId column (existing row gets "valentin")
ALTER TABLE "InvestPlan" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT 'valentin';
ALTER TABLE "InvestPlan" ADD CONSTRAINT "InvestPlan_userId_key" UNIQUE ("userId");
-- Change id column to autoincrement (sequence already exists as the row has id=1)
ALTER TABLE "InvestPlan" ALTER COLUMN "id" DROP DEFAULT;
CREATE SEQUENCE IF NOT EXISTS "InvestPlan_id_seq" START WITH 2 OWNED BY "InvestPlan"."id";
ALTER TABLE "InvestPlan" ALTER COLUMN "id" SET DEFAULT nextval('"InvestPlan_id_seq"');
