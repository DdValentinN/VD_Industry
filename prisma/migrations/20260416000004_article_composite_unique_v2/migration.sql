-- Replace global unique on articleId with composite unique (articleId, userId)
-- Fully idempotent: safe to run even if constraint already exists or doesn't

ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_articleId_key";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Article_articleId_userId_key'
  ) THEN
    ALTER TABLE "Article" ADD CONSTRAINT "Article_articleId_userId_key" UNIQUE ("articleId", "userId");
  END IF;
END $$;
