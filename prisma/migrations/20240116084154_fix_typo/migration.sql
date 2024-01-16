/*
  Warnings:

  - You are about to drop the `Enviroment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EnviromentRules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EnviromentTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikedEnviroments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Enviroment" DROP CONSTRAINT "Enviroment_userId_fkey";

-- DropForeignKey
ALTER TABLE "EnviromentRules" DROP CONSTRAINT "EnviromentRules_enviromentId_fkey";

-- DropForeignKey
ALTER TABLE "EnviromentRules" DROP CONSTRAINT "EnviromentRules_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "EnviromentTags" DROP CONSTRAINT "EnviromentTags_enviromentId_fkey";

-- DropForeignKey
ALTER TABLE "EnviromentTags" DROP CONSTRAINT "EnviromentTags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "LikedEnviroments" DROP CONSTRAINT "LikedEnviroments_enviromentId_fkey";

-- DropForeignKey
ALTER TABLE "LikedEnviroments" DROP CONSTRAINT "LikedEnviroments_userId_fkey";

-- DropTable
DROP TABLE "Enviroment";

-- DropTable
DROP TABLE "EnviromentRules";

-- DropTable
DROP TABLE "EnviromentTags";

-- DropTable
DROP TABLE "LikedEnviroments";

-- CreateTable
CREATE TABLE "Environment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" BYTEA,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentRules" (
    "id" SERIAL NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedEnvironment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LikedEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentTags" (
    "id" SERIAL NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikedEnvironment_userId_environmentId_key" ON "LikedEnvironment"("userId", "environmentId");

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentRules" ADD CONSTRAINT "EnvironmentRules_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentRules" ADD CONSTRAINT "EnvironmentRules_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedEnvironment" ADD CONSTRAINT "LikedEnvironment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedEnvironment" ADD CONSTRAINT "LikedEnvironment_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentTags" ADD CONSTRAINT "EnvironmentTags_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentTags" ADD CONSTRAINT "EnvironmentTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
