-- DropIndex
DROP INDEX "Service_code_key";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "code" DROP NOT NULL;
