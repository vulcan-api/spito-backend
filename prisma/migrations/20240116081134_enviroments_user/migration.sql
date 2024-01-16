/*
  Warnings:

  - Added the required column `userId` to the `Enviroment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enviroment" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Enviroment" ADD CONSTRAINT "Enviroment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
