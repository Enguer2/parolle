-- Create HistoricalFact safely if missing
create table if not exists public."HistoricalFact" (
  id       serial primary key,
  "date"   date not null,
  fact_fr  text,
  fact_en  text,
  fact_co  text,
  "wordId" integer references public."Word"(id) on delete set null on update cascade,
  constraint "HistoricalFact_date_key" unique ("date")
);
