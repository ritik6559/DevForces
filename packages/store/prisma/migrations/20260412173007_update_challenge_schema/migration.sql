/*
  Warnings:

  - You are about to drop the column `s3_prefix` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "s3_prefix";
