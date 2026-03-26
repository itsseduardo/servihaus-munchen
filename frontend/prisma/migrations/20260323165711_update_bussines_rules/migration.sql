/*
  Warnings:

  - You are about to drop the column `name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ServiceAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ServiceAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ServiceAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `workedHours` on the `ServiceAssignment` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Made the column `startTime` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FIXED', 'HOURLY');

-- DropForeignKey
ALTER TABLE "ServiceAssignment" DROP CONSTRAINT "ServiceAssignment_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAssignment" DROP CONSTRAINT "ServiceAssignment_serviceId_fkey";

-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "name",
ADD COLUMN     "contractedHoursPerDay" DOUBLE PRECISION,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "time",
ADD COLUMN     "actualStartTime" TIMESTAMP(3),
ADD COLUMN     "importantNotes" TEXT,
ADD COLUMN     "serviceCodeId" INTEGER,
ALTER COLUMN "startTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "ServiceAssignment" DROP COLUMN "createdAt",
DROP COLUMN "notes",
DROP COLUMN "status",
DROP COLUMN "workedHours",
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ServiceCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCode_code_key" ON "ServiceCode"("code");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceCodeId_fkey" FOREIGN KEY ("serviceCodeId") REFERENCES "ServiceCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
