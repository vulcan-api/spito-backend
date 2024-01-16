-- CreateTable
CREATE TABLE "Enviroment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" BYTEA,

    CONSTRAINT "Enviroment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnviromentRules" (
    "id" SERIAL NOT NULL,
    "enviromentId" INTEGER NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnviromentRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnviromentTags" (
    "id" SERIAL NOT NULL,
    "enviromentId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnviromentTags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnviromentRules" ADD CONSTRAINT "EnviromentRules_enviromentId_fkey" FOREIGN KEY ("enviromentId") REFERENCES "Enviroment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnviromentRules" ADD CONSTRAINT "EnviromentRules_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnviromentTags" ADD CONSTRAINT "EnviromentTags_enviromentId_fkey" FOREIGN KEY ("enviromentId") REFERENCES "Enviroment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnviromentTags" ADD CONSTRAINT "EnviromentTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
