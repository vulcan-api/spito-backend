/*
  Warnings:

  - A unique constraint covering the columns `[environmentId,ruleId]` on the table `EnvironmentRules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentRules_environmentId_ruleId_key" ON "EnvironmentRules"("environmentId", "ruleId");
