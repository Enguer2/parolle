model HistoricalFact {
  id       Int      @id @default(autoincrement())
  date     DateTime @db.Date
  month    Int
  day      Int
  fact_fr  String?
  fact_en  String?
  fact_co  String?
  wordId   Int?
  word     Word?    @relation(fields: [wordId], references: [id])

  @@unique([date])
  @@index([month, day])
}
