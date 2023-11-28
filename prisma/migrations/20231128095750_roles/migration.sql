-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VERIFIED_USER', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "Role"[];
