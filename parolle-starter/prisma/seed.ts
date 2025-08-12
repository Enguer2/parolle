import fs from 'fs'
import path from 'path'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()

const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

type SeedWord = { text: string; kind: WordKind }
type SeedMonth = { locale: string; month: number; afterDay: string }
type SeedFact = { date: string; fr?: string; en?: string; co?: string }

function loadJSON<T>(fileName: string): T[] | null {
  const filePath = path.join(process.cwd(), 'prisma', 'data', fileName)
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : null
}

function dateAtUtcMidnight(iso: string): Date {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new Error(`Date invalide: ${iso}`)
  return d
}

async function main() {
  // 1) MonthName
  const months = loadJSON<SeedMonth>('months.json')
  if (months?.length) {
    console.log(`Seeding ${months.length} month names…`)
    for (const m of months) {
      await prisma.monthName.upsert({
        where: { locale_month: { locale: m.locale, month: m.month } },
        update: { afterDay: m.afterDay },
        create: m
      })
    }
  } else {
    console.warn('Aucun mois chargé: months.json introuvable ou vide.')
  }

  // 2) Words
  const words = loadJSON<SeedWord>('words.json')
  if (words?.length) {
    console.log(`Seeding ${words.length} words…`)
    for (const w of words) {
      await prisma.word.upsert({
        where: { text_kind: { text: w.text, kind: w.kind } },
        update: {},
        create: {
          text: w.text,
          text_base: toBase(w.text),
          length: w.text.length,
          kind: w.kind
        }
      })
    }
  } else {
    console.warn('Aucun mot chargé: words.json introuvable ou vide.')
  }

  // 3) Historical facts
  const facts = loadJSON<SeedFact>('facts_by_date.json')
  if (facts?.length) {
    console.log(`Seeding ${facts.length} historical facts…`)
    for (const f of facts) {
      try {
        const dateObj = dateAtUtcMidnight(f.date)
        await prisma.historicalFact.upsert({
          where: { date: dateObj },
          update: { fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null },
          create: { date: dateObj, fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null }
        })
      } catch (err) {
        console.warn('Fact ignoré (date invalide):', f, err)
      }
    }
  } else {
    console.warn('Aucun fait chargé: facts_by_date.json introuvable ou vide.')
  }

  // 4) DailyAnswer
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const firstAnswer = await prisma.word.findFirst({
    where: { kind: WordKind.ANSWER, is_active: true },
    orderBy: { id: 'asc' }
  })
  if (firstAnswer) {
    await prisma.dailyAnswer.upsert({
      where: { date: today },
      update: { wordId: firstAnswer.id },
      create: { date: today, wordId: firstAnswer.id }
    })
  }

  console.log('Seed OK ✅')
}

main()
  .catch((e) => console.error('Seed failed:', e))
  .finally(async () => await prisma.$disconnect())
