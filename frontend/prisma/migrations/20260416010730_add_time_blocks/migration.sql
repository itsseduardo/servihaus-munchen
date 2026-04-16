/*
  Warnings:

  - The values [FIXED,HOURLY] on the enum `EmploymentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contractedHoursPerDay` on the `Employee` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('TIME', 'FIXED');

-- CreateEnum
CREATE TYPE "TimeBlockType" AS ENUM ('VACATION', 'SICK', 'CLIENT_CANCELLED', 'PAID_LEAVE');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PRIVAT', 'FIRMA');

-- AlterEnum
BEGIN;
CREATE TYPE "EmploymentType_new" AS ENUM ('MINIJOB_538', 'MIDIJOB', 'FULL_TIME');
ALTER TABLE "Employee" ALTER COLUMN "employmentType" TYPE "EmploymentType_new" USING ("employmentType"::text::"EmploymentType_new");
ALTER TYPE "EmploymentType" RENAME TO "EmploymentType_old";
ALTER TYPE "EmploymentType_new" RENAME TO "EmploymentType";
DROP TYPE "EmploymentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "clientType" "ClientType" NOT NULL DEFAULT 'PRIVAT';

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "contractedHoursPerDay",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contractedHoursPerWeek" DOUBLE PRECISION,
ADD COLUMN     "vacationDaysPerYear" INTEGER;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "billedHours" DOUBLE PRECISION,
ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "parentServiceId" INTEGER,
ADD COLUMN     "pricingModel" "PricingModel" NOT NULL DEFAULT 'TIME',
ADD COLUMN     "recurrenceDays" TEXT[],
ADD COLUMN     "recurrenceEnd" TIMESTAMP(3),
ADD COLUMN     "recurrenceInterval" INTEGER,
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "teamDuration" DOUBLE PRECISION,
ADD COLUMN     "travelTime" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" INTEGER,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeBlock" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "type" "TimeBlockType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
