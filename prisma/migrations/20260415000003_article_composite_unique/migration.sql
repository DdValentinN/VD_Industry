-- Change Article.articleId from global unique to composite unique (articleId, userId)
-- This allows multiple users to each have their own A-001, A-002, etc.
-- Fully idempotent: safe to re-run

ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_articleId_key";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Article_articleId_userId_key'
  ) THEN
    ALTER TABLE "Article" ADD CONSTRAINT "Article_articleId_userId_key" UNIQUE ("articleId", "userId");
  END IF;
END $$;
