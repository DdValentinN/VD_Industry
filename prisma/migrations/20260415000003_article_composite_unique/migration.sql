-- Change Article.articleId from global unique to composite unique (articleId, userId)
-- This allows multiple users to each have their own A-001, A-002, etc.

ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_articleId_key";
ALTER TABLE "Article" ADD CONSTRAINT "Article_articleId_userId_key" UNIQUE ("articleId", "userId");
