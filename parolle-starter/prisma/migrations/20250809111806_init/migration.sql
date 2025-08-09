-- CreateEnum
CREATE TYPE "public"."WordKind" AS ENUM ('ANSWER', 'GUESS');

-- CreateTable
CREATE TABLE "public"."Word" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(32) NOT NULL,
    "text_base" VARCHAR(32) NOT NULL,
    "length" INTEGER NOT NULL,
    "kind" "public"."WordKind" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "def_fr" TEXT,
    "ex_co" TEXT,
    "dialect" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyAnswer" (
    "date" TIMESTAMP(3) NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "DailyAnswer_pkey" PRIMARY KEY ("date")
);

-- CreateIndex
CREATE INDEX "Word_length_idx" ON "public"."Word"("length");

-- CreateIndex
CREATE UNIQUE INDEX "text_kind" ON "public"."Word"("text", "kind");

-- CreateIndex
CREATE INDEX "DailyAnswer_wordId_idx" ON "public"."DailyAnswer"("wordId");

-- AddForeignKey
ALTER TABLE "public"."DailyAnswer" ADD CONSTRAINT "DailyAnswer_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
