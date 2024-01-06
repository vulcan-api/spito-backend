/*
  Warnings:

  - A unique constraint covering the columns `[userId,ruleId]` on the table `LikedRules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LikedRules_userId_ruleId_key" ON "LikedRules"("userId", "ruleId");
