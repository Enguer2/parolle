// prisma/seed.ts
import fs from 'fs'
import path from 'path'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()

const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

type SeedWord = { text: string; kind: WordKind }
type SeedFact = { date: string; fr?: string; en?: string; co?: string }

// ---- helpers ----------------------------------------------------
function dateAtUtcMidnight(iso: string): Date {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new Error(`Date invalide: ${iso}`)
  return d
}

async function factsHaveMonthDay(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'HistoricalFact'
        AND column_name IN ('month','day')
    `
    const set = new Set(rows.map(r => r.column_name))
    return set.has('month') && set.has('day')
  } catch {
    return false
  }
}

// ---- main -------------------------------------------------------
async function main() {
  // 0) Load optional data files
  const dataDir = path.join(process.cwd(), 'prisma', 'data')
  const wordsPath = path.join(dataDir, 'words.json')
  const factsPath = path.join(dataDir, 'facts_by_date.json') // <-- corriger ici

  const externalWords: SeedWord[] | null =
    fs.existsSync(wordsPath) ? JSON.parse(fs.readFileSync(wordsPath, 'utf8')) : null

  const externalFacts: SeedFact[] | null =
    fs.existsSync(factsPath) ? JSON.parse(fs.readFileSync(factsPath, 'utf8')) : null

  // 1) MonthName
  const months = [
    { locale: 'co', month: 1,  afterDay: 'di Ghjennaghju' },
    { locale: 'co', month: 2,  afterDay: 'di Frivaghju'  },
    { locale: 'co', month: 3,  afterDay: 'di Marzu'     },
    { locale: 'co', month: 4,  afterDay: "d'Aprile"     },
    { locale: 'co', month: 5,  afterDay: 'di Maghju'    },
    { locale: 'co', month: 6,  afterDay: 'di Ghjugnu'   },
    { locale: 'co', month: 7,  afterDay: 'di Lugliu'    },
    { locale: 'co', month: 8,  afterDay: "d'Aostu"      },
    { locale: 'co', month: 9,  afterDay: 'di Settembre' },
    { locale: 'co', month: 10, afterDay: "d'Uttrovi"    },
    { locale: 'co', month: 11, afterDay: 'di Nuvembre'  },
    { locale: 'co', month: 12, afterDay: 'di Dicembre'  },

    { locale: 'fr', month: 1,  afterDay: 'janvier'   },
    { locale: 'fr', month: 2,  afterDay: 'février'   },
    { locale: 'fr', month: 3,  afterDay: 'mars'      },
    { locale: 'fr', month: 4,  afterDay: 'avril'     },
    { locale: 'fr', month: 5,  afterDay: 'mai'       },
    { locale: 'fr', month: 6,  afterDay: 'juin'      },
    { locale: 'fr', month: 7,  afterDay: 'juillet'   },
    { locale: 'fr', month: 8,  afterDay: 'août'      },
    { locale: 'fr', month: 9,  afterDay: 'septembre' },
    { locale: 'fr', month: 10, afterDay: 'octobre'   },
    { locale: 'fr', month: 11, afterDay: 'novembre'  },
    { locale: 'fr', month: 12, afterDay: 'décembre'  },

    { locale: 'en', month: 1,  afterDay: 'January'   },
    { locale: 'en', month: 2,  afterDay: 'February'  },
    { locale: 'en', month: 3,  afterDay: 'March'     },
    { locale: 'en', month: 4,  afterDay: 'April'     },
    { locale: 'en', month: 5,  afterDay: 'May'       },
    { locale: 'en', month: 6,  afterDay: 'June'      },
    { locale: 'en', month: 7,  afterDay: 'July'      },
    { locale: 'en', month: 8,  afterDay: 'August'    },
    { locale: 'en', month: 9,  afterDay: 'September' },
    { locale: 'en', month: 10, afterDay: 'October'   },
    { locale: 'en', month: 11, afterDay: 'November'  },
    { locale: 'en', month: 12, afterDay: 'December'  },
  ]

  for (const m of months) {
    await prisma.monthName.upsert({
      where: { locale_month: { locale: m.locale, month: m.month } },
      update: { afterDay: m.afterDay },
      create: m,
    })
  }

  // 2) Words (depuis words.json si présent)
  if (externalWords?.length) {
    console.log(`Seeding ${externalWords.length} words…`)
    for (const w of externalWords) {
      await prisma.word.upsert({
        where: { text_kind: { text: w.text, kind: w.kind } },
        update: {},
        create: {
          text: w.text,
          text_base: toBase(w.text),
          length: w.text.length,
          kind: w.kind,
        }
      })
    }
  } else {
    console.warn('Aucun mot chargé: prisma/data/words.json introuvable ou vide (ce n’est pas bloquant).')
  }

  // 3) Historical facts (depuis facts_by_date.json)
  if (!externalFacts?.length) {
    console.warn('Aucun fait chargé: prisma/data/facts_by_date.json introuvable ou vide.')
  } else {
    console.log(`Seeding ${externalFacts.length} historical facts…`)
    const hasMonthDay = await factsHaveMonthDay()
    for (const f of externalFacts) {
      try {
        const dateObj = dateAtUtcMidnight(f.date) // YYYY-MM-DD
        const m = dateObj.getUTCMonth() + 1
        const d = dateObj.getUTCDate()

        if (hasMonthDay) {
          await prisma.historicalFact.upsert({
            where: { date: dateObj },
            update: { fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null, month: m, day: d },
            create: { date: dateObj, month: m, day: d, fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null }
          })
        } else {
          await prisma.historicalFact.upsert({
            where: { date: dateObj },
            update: { fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null },
            create: { date: dateObj,          fact_fr: f.fr ?? null, fact_en: f.en ?? null, fact_co: f.co ?? null }
          })
        }
      } catch (err) {
        console.warn('Fact ignoré (date invalide):', f, err)
      }
    }
  }

  // 4) DailyAnswer aujourd’hui (premier ANSWER actif)
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

  console.log('Seed OK')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
