/*
  Warnings:

  - You are about to drop the column `points` on the `ContestSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submission` on the `ContestSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `LeaderBoard` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Submission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contest_id,user_id]` on the table `LeaderBoard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end_time` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `files` to the `ContestSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_score` to the `LeaderBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `LeaderBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `files` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'ENDED');

-- DropIndex
DROP INDEX "LeaderBoard_contest_id_rank_key";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "allowed_deps" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "starter_files" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "test_files" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "notion_doc_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "ContestStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "ContestSubmission" DROP COLUMN "points",
DROP COLUMN "submission",
ADD COLUMN     "files" JSONB NOT NULL,
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "LeaderBoard" DROP COLUMN "rank",
ADD COLUMN     "total_score" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "description",
DROP COLUMN "points",
ADD COLUMN     "files" JSONB NOT NULL,
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_score" INTEGER NOT NULL,
    "tests_score" INTEGER NOT NULL,
    "static_score" INTEGER NOT NULL,
    "endpoint_score" INTEGER NOT NULL,
    "tests_passed" INTEGER NOT NULL,
    "tests_total" INTEGER NOT NULL,
    "test_details" JSONB NOT NULL,
    "lint_details" JSONB NOT NULL,
    "llm_feedback" TEXT,
    "execution_time_ms" INTEGER NOT NULL,

    CONSTRAINT "EvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestEvaluationResult" (
    "id" TEXT NOT NULL,
    "contest_submission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_score" INTEGER NOT NULL,
    "tests_score" INTEGER NOT NULL,
    "static_score" INTEGER NOT NULL,
    "endpoint_score" INTEGER NOT NULL,
    "tests_passed" INTEGER NOT NULL,
    "tests_total" INTEGER NOT NULL,
    "test_details" JSONB NOT NULL,
    "lint_details" JSONB NOT NULL,
    "llm_feedback" TEXT,
    "execution_time_ms" INTEGER NOT NULL,

    CONSTRAINT "ContestEvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationResult_submission_id_key" ON "EvaluationResult"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestEvaluationResult_contest_submission_id_key" ON "ContestEvaluationResult"("contest_submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderBoard_contest_id_user_id_key" ON "LeaderBoard"("contest_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestEvaluationResult" ADD CONSTRAINT "ContestEvaluationResult_contest_submission_id_fkey" FOREIGN KEY ("contest_submission_id") REFERENCES "ContestSubmission"("contest_submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
