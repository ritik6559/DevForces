/*
  Warnings:

  - You are about to drop the column `starter_files` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `test_files` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint_score` on the `EvaluationResult` table. All the data in the column will be lost.
  - You are about to drop the column `lint_details` on the `EvaluationResult` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the `ContestEvaluationResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContestSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `s3_prefix` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChallengeProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED');

-- DropForeignKey
ALTER TABLE "ContestEvaluationResult" DROP CONSTRAINT "ContestEvaluationResult_contest_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "ContestSubmission" DROP CONSTRAINT "ContestSubmission_contest_to_challenge_mapping_id_fkey";

-- DropForeignKey
ALTER TABLE "ContestSubmission" DROP CONSTRAINT "ContestSubmission_user_id_fkey";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "starter_files",
DROP COLUMN "test_files",
ADD COLUMN     "s3_prefix" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EvaluationResult" DROP COLUMN "endpoint_score",
DROP COLUMN "lint_details";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "files",
ADD COLUMN     "contest_to_challenge_mapping_id" TEXT,
ADD COLUMN     "submission_s3_prefix" TEXT;

-- DropTable
DROP TABLE "ContestEvaluationResult";

-- DropTable
DROP TABLE "ContestSubmission";

-- CreateTable
CREATE TABLE "UserChallengeProgress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "status" "ChallengeProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "draft_s3_prefix" TEXT,
    "last_saved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChallengeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChallengeProgress_user_id_challenge_id_contest_id_key" ON "UserChallengeProgress"("user_id", "challenge_id", "contest_id");

-- AddForeignKey
ALTER TABLE "UserChallengeProgress" ADD CONSTRAINT "UserChallengeProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeProgress" ADD CONSTRAINT "UserChallengeProgress_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("challenge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeProgress" ADD CONSTRAINT "UserChallengeProgress_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("contest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_contest_to_challenge_mapping_id_fkey" FOREIGN KEY ("contest_to_challenge_mapping_id") REFERENCES "ContestToChallengeMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
