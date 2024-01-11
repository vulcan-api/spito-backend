-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "description" TEXT,
ADD COLUMN     "unsafe" BOOLEAN NOT NULL DEFAULT false;
