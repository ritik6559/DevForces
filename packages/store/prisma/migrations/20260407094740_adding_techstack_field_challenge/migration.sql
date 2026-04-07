/*
  Warnings:

  - Added the required column `tech_stack` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TechStack" AS ENUM ('NODEJS', 'PYTHON');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "tech_stack" "TechStack" NOT NULL;
