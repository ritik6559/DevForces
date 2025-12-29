/*
  Warnings:

  - Changed the type of `difficulty` on the `Challenge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL;
