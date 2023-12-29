/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Ruleset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ruleset_url_key" ON "Ruleset"("url");
