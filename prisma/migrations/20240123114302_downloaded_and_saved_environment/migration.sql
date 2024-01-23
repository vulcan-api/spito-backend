-- CreateTable
CREATE TABLE "SavedEnvironment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadedEnvironment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadedEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedEnvironment_userId_environmentId_key" ON "SavedEnvironment"("userId", "environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadedEnvironment_userId_environmentId_key" ON "DownloadedEnvironment"("userId", "environmentId");

-- AddForeignKey
ALTER TABLE "SavedEnvironment" ADD CONSTRAINT "SavedEnvironment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedEnvironment" ADD CONSTRAINT "SavedEnvironment_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadedEnvironment" ADD CONSTRAINT "DownloadedEnvironment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadedEnvironment" ADD CONSTRAINT "DownloadedEnvironment_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
