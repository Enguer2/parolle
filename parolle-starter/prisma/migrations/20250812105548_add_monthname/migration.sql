-- CreateTable
CREATE TABLE "public"."MonthName" (
    "id" SERIAL NOT NULL,
    "locale" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "afterDay" TEXT NOT NULL,

    CONSTRAINT "MonthName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthName_locale_month_key" ON "public"."MonthName"("locale", "month");
