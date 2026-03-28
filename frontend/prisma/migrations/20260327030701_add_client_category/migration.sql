/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClientCategory" AS ENUM ('A', 'B', 'C', 'D', 'E', 'Z');

-- DropForeignKey
ALTER TABLE "ServiceAssignment" DROP CONSTRAINT "ServiceAssignment_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAssignment" DROP CONSTRAINT "ServiceAssignment_serviceId_fkey";

-- DropIndex
DROP INDEX "ServiceCode_code_key";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "employmentType" DROP NOT NULL,
ALTER COLUMN "employmentType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "startTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceAssignment" ALTER COLUMN "assignedAt" DROP NOT NULL,
ALTER COLUMN "assignedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
