-- CreateTable
CREATE TABLE "LikedRules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LikedRules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LikedRules" ADD CONSTRAINT "LikedRules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedRules" ADD CONSTRAINT "LikedRules_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
