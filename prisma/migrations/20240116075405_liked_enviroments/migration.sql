/*
  Warnings:

  - Added the required column `updatedAt` to the `Enviroment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enviroment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "LikedEnviroments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "enviromentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LikedEnviroments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikedEnviroments_userId_enviromentId_key" ON "LikedEnviroments"("userId", "enviromentId");

-- AddForeignKey
ALTER TABLE "LikedEnviroments" ADD CONSTRAINT "LikedEnviroments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedEnviroments" ADD CONSTRAINT "LikedEnviroments_enviromentId_fkey" FOREIGN KEY ("enviromentId") REFERENCES "Enviroment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
