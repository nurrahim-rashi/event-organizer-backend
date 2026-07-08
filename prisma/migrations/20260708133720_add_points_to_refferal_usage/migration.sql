/*
  Warnings:

  - Added the required column `expiredAt` to the `referral_usages` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `ticket_types` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `referralCode` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TicketName" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'EARLY_BIRD');

-- AlterTable
ALTER TABLE "referral_usages" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPointUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 10000;

-- AlterTable
ALTER TABLE "ticket_types" DROP COLUMN "name",
ADD COLUMN     "name" "TicketName" NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "referralCode" SET NOT NULL;
