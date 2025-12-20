-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "contest_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("contest_id")
);

-- CreateTable
CREATE TABLE "ContestToChallengeMapping" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "ContestToChallengeMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "challenge_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notion_doc_id" TEXT NOT NULL,
    "max_points" INTEGER NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("challenge_id")
);

-- CreateTable
CREATE TABLE "ContestSubmission" (
    "contest_submission_id" TEXT NOT NULL,
    "submission" TEXT NOT NULL,
    "contest_to_challenge_mapping_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestSubmission_pkey" PRIMARY KEY ("contest_submission_id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submission_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "LeaderBoard" (
    "leaderboard_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" TEXT NOT NULL,

    CONSTRAINT "LeaderBoard_pkey" PRIMARY KEY ("leaderboard_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContestToChallengeMapping_contest_id_challenge_id_key" ON "ContestToChallengeMapping"("contest_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderBoard_contest_id_rank_key" ON "LeaderBoard"("contest_id", "rank");

-- AddForeignKey
ALTER TABLE "ContestToChallengeMapping" ADD CONSTRAINT "ContestToChallengeMapping_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("contest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestToChallengeMapping" ADD CONSTRAINT "ContestToChallengeMapping_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("challenge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestSubmission" ADD CONSTRAINT "ContestSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestSubmission" ADD CONSTRAINT "ContestSubmission_contest_to_challenge_mapping_id_fkey" FOREIGN KEY ("contest_to_challenge_mapping_id") REFERENCES "ContestToChallengeMapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("challenge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderBoard" ADD CONSTRAINT "LeaderBoard_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("contest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderBoard" ADD CONSTRAINT "LeaderBoard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
