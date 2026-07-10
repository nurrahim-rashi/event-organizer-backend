/*
  Warnings:

  - The values [PAID] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `expiredAt` to the `referral_usages` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `ticket_types` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `pointUsed` on table `transactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `referralCode` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TicketName" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'EARLY_BIRD');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "referral_usages" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPointUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 10000;

-- AlterTable
ALTER TABLE "ticket_types" DROP COLUMN "name",
ADD COLUMN     "name" "TicketName" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'WAITING_PAYMENT',
ALTER COLUMN "pointUsed" SET NOT NULL,
ALTER COLUMN "pointUsed" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "referralCode" SET NOT NULL;

-- CreateTable
CREATE TABLE "point_histories" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "point_histories" ADD CONSTRAINT "point_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
