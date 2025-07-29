-- AlterTable
ALTER TABLE "PONumberFormat" ALTER COLUMN "currentNumber" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "YuanIdrRate" (
    "id" TEXT NOT NULL,
    "yuanToIdrRate" DOUBLE PRECISION NOT NULL,
    "idrToYuanRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YuanIdrRate_pkey" PRIMARY KEY ("id")
);
