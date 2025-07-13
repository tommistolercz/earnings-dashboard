-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mandayRate" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL,
    "country" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "workHoursStart" INTEGER NOT NULL,
    "workHoursEnd" INTEGER NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
