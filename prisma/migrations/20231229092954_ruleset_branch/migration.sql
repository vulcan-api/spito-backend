/*
  Warnings:

  - Added the required column `branch` to the `Ruleset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ruleset" ADD COLUMN     "branch" TEXT NOT NULL;
