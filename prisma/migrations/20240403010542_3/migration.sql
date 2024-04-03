/*
  Warnings:

  - Changed the type of `credentialBackedUp` on the `Authenticator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Authenticator" DROP COLUMN "credentialBackedUp",
ADD COLUMN     "credentialBackedUp" INTEGER NOT NULL,
ALTER COLUMN "transports" SET NOT NULL,
ALTER COLUMN "transports" SET DATA TYPE TEXT;
