/*
  Warnings:

  - You are about to drop the column `category` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "category" "ClientCategory" NOT NULL DEFAULT 'C';

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "category";
