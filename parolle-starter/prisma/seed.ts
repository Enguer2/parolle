// prisma/seed.ts
import fs from 'fs'
import path from 'path'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()

const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

type SeedWord = { text: string; kind: WordKind }
type SeedFact = { date: string; fr?: string; en?: string; co?: string }

function dateAtUtcMidnight(dateISO: string): Date {
  // force un Date correct au format YYYY-MM-DDT00:00:00Z
  const d = new Date(`${dateISO}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Date invalide: ${dateISO}`)
  }
  return d
}

async function main() {
  // -----------------------------
  // 0) Optionnel : charger des JSON externes si présents
  // -----------------------------
  const dataDir = path.join(process.cwd(), 'prisma', 'data')
  const hasDataDir = fs.existsSync(dataDir)

  const loadJson = <T = unknown>(fname: string): T | null => {
    try {
      const p = path.join(dataDir, fname)
      if (!hasDataDir || !fs.existsSync(p)) return null
      return JSON.parse(fs.readFileSync(p, 'utf8')) as T
    } catch {
      return null
    }
  }

  const externalWords = loadJson<SeedWord[]>('words.json') // optionnel
  const externalFacts = loadJson<SeedFact[]>('facts_by_date.json') // optionnel

  // -----------------------------
  // 1) Mois localisés (MonthName)
  // -----------------------------
  const months = [
    // Corse (après le jour)
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

    // Français
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

    // Anglais (jour–mois–année pour rester homogène avec le front)
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

  // -----------------------------
  // 2) Mots (Word)
  // -----------------------------
  const builtInWords: SeedWord[] = [
      { text: 'ACQUA', kind: 'ANSWER' }, { text: 'ACQUA', kind: 'GUESS' },
      { text: 'AGHJA', kind: 'ANSWER' }, { text: 'AGHJA', kind: 'GUESS' },
      { text: 'AJACCIU', kind: 'ANSWER' }, { text: 'AJACCIU', kind: 'GUESS' },
      { text: 'ALERIA', kind: 'ANSWER' }, { text: 'ALERIA', kind: 'GUESS' },
      { text: 'ALIVA', kind: 'ANSWER' }, { text: 'ALIVA', kind: 'GUESS' },
      { text: 'ALIVETU', kind: 'ANSWER' }, { text: 'ALIVETU', kind: 'GUESS' },
      { text: 'AEREU', kind: 'ANSWER' }, { text: 'AEREU', kind: 'GUESS' },
      { text: 'AMICU', kind: 'ANSWER' }, { text: 'AMICU', kind: 'GUESS' },
      { text: 'APRILE', kind: 'ANSWER' }, { text: 'APRILE', kind: 'GUESS' },
      { text: 'BALAGNA', kind: 'ANSWER' }, { text: 'BALAGNA', kind: 'GUESS' },
      { text: 'BALLA', kind: 'ANSWER' }, { text: 'BALLA', kind: 'GUESS' },
      { text: 'BARCA', kind: 'ANSWER' }, { text: 'BARCA', kind: 'GUESS' },
      { text: 'BASTIA', kind: 'ANSWER' }, { text: 'BASTIA', kind: 'GUESS' },
      { text: 'BANDERIA', kind: 'ANSWER' }, { text: 'BANDERIA', kind: 'GUESS' },
      { text: 'BAVELLA', kind: 'ANSWER' }, { text: 'BAVELLA', kind: 'GUESS' },
      { text: 'BELLU', kind: 'ANSWER' }, { text: 'BELLU', kind: 'GUESS' },
      { text: 'BIRRA', kind: 'ANSWER' }, { text: 'BIRRA', kind: 'GUESS' },
      { text: 'BONIFAZIU', kind: 'ANSWER' }, { text: 'BONIFAZIU', kind: 'GUESS' },
      { text: 'BROCCIU', kind: 'ANSWER' }, { text: 'BROCCIU', kind: 'GUESS' },
      { text: 'CALVI', kind: 'ANSWER' }, { text: 'CALVI', kind: 'GUESS' },
      { text: 'CAMPAGNA', kind: 'ANSWER' }, { text: 'CAMPAGNA', kind: 'GUESS' },
      { text: 'CANTADOR', kind: 'ANSWER' }, { text: 'CANTADOR', kind: 'GUESS' },
      { text: 'CANTA', kind: 'ANSWER' }, { text: 'CANTA', kind: 'GUESS' },
      { text: 'CAPICORSU', kind: 'ANSWER' }, { text: 'CAPICORSU', kind: 'GUESS' },
      { text: 'CASTAGNA', kind: 'ANSWER' }, { text: 'CASTAGNA', kind: 'GUESS' },
      { text: 'CASTAGNE', kind: 'ANSWER' }, { text: 'CASTAGNE', kind: 'GUESS' },
      { text: 'CAFFE', kind: 'ANSWER' }, { text: 'CAFFE', kind: 'GUESS' },
      { text: 'CAVALLU', kind: 'ANSWER' }, { text: 'CAVALLU', kind: 'GUESS' },
      { text: 'CIPOLLA', kind: 'ANSWER' }, { text: 'CIPOLLA', kind: 'GUESS' },
      { text: 'CORTI', kind: 'ANSWER' }, { text: 'CORTI', kind: 'GUESS' },
      { text: 'CORRE', kind: 'ANSWER' }, { text: 'CORRE', kind: 'GUESS' },
      { text: 'DICEMBRE', kind: 'ANSWER' }, { text: 'DICEMBRE', kind: 'GUESS' },
      { text: 'DOLCE', kind: 'ANSWER' }, { text: 'DOLCE', kind: 'GUESS' },
      { text: 'DUMENICA', kind: 'ANSWER' }, { text: 'DUMENICA', kind: 'GUESS' },
      { text: 'ESTATE', kind: 'ANSWER' }, { text: 'ESTATE', kind: 'GUESS' },
      { text: 'FEMINA', kind: 'ANSWER' }, { text: 'FEMINA', kind: 'GUESS' },
      { text: 'FERRAGHJU', kind: 'ANSWER' }, { text: 'FERRAGHJU', kind: 'GUESS' },
      { text: 'FESTIGHJ', kind: 'ANSWER' }, { text: 'FESTIGHJ', kind: 'GUESS' },
      { text: 'FIURE', kind: 'ANSWER' }, { text: 'FIURE', kind: 'GUESS' },
      { text: 'FIGATELLU', kind: 'ANSWER' }, { text: 'FIGATELLU', kind: 'GUESS' },
      { text: 'FIERU', kind: 'ANSWER' }, { text: 'FIERU', kind: 'GUESS' },
      { text: 'FURESTA', kind: 'ANSWER' }, { text: 'FURESTA', kind: 'GUESS' },
      { text: 'FURESTER', kind: 'ANSWER' }, { text: 'FURESTER', kind: 'GUESS' },
      { text: 'FRATE', kind: 'ANSWER' }, { text: 'FRATE', kind: 'GUESS' },
      { text: 'FRATELLI', kind: 'ANSWER' }, { text: 'FRATELLI', kind: 'GUESS' },
      { text: 'GHJATTU', kind: 'ANSWER' }, { text: 'GHJATTU', kind: 'GUESS' },
      { text: 'GHJELU', kind: 'ANSWER' }, { text: 'GHJELU', kind: 'GUESS' },
      { text: 'GHJENTE', kind: 'ANSWER' }, { text: 'GHJENTE', kind: 'GUESS' },
      { text: 'GHJOCU', kind: 'ANSWER' }, { text: 'GHJOCU', kind: 'GUESS' },
      { text: 'GHJOVI', kind: 'ANSWER' }, { text: 'GHJOVI', kind: 'GUESS' },
      { text: 'GHJUGNU', kind: 'ANSWER' }, { text: 'GHJUGNU', kind: 'GUESS' },
      { text: 'GHJUVENTU', kind: 'ANSWER' }, { text: 'GHJUVENTU', kind: 'GUESS' },
      { text: 'INVERNU', kind: 'ANSWER' }, { text: 'INVERNU', kind: 'GUESS' },
      { text: 'ISULA', kind: 'ANSWER' }, { text: 'ISULA', kind: 'GUESS' },
      { text: 'ISULETTI', kind: 'ANSWER' }, { text: 'ISULETTI', kind: 'GUESS' },
      { text: 'LEGHJE', kind: 'ANSWER' }, { text: 'LEGHJE', kind: 'GUESS' },
      { text: 'LETTERA', kind: 'ANSWER' }, { text: 'LETTERA', kind: 'GUESS' },
      { text: 'LIBRU', kind: 'ANSWER' }, { text: 'LIBRU', kind: 'GUESS' },
      { text: 'LINGUA', kind: 'ANSWER' }, { text: 'LINGUA', kind: 'GUESS' },
      { text: 'LUMERA', kind: 'ANSWER' }, { text: 'LUMERA', kind: 'GUESS' },
      { text: 'MACCHJIA', kind: 'ANSWER' }, { text: 'MACCHJIA', kind: 'GUESS' },
      { text: 'MAGHJU', kind: 'ANSWER' }, { text: 'MAGHJU', kind: 'GUESS' },
      { text: 'MAESTRA', kind: 'ANSWER' }, { text: 'MAESTRA', kind: 'GUESS' },
      { text: 'MANGHJA', kind: 'ANSWER' }, { text: 'MANGHJA', kind: 'GUESS' },
      { text: 'MANTELLU', kind: 'ANSWER' }, { text: 'MANTELLU', kind: 'GUESS' },
      { text: 'MARTI', kind: 'ANSWER' }, { text: 'MARTI', kind: 'GUESS' },
      { text: 'MURTA', kind: 'ANSWER' }, { text: 'MURTA', kind: 'GUESS' },
      { text: 'MONTE', kind: 'ANSWER' }, { text: 'MONTE', kind: 'GUESS' },
      { text: 'MUNTAGNA', kind: 'ANSWER' }, { text: 'MUNTAGNA', kind: 'GUESS' },
      { text: 'MUNTI', kind: 'ANSWER' }, { text: 'MUNTI', kind: 'GUESS' },
      { text: 'NEBBIU', kind: 'ANSWER' }, { text: 'NEBBIU', kind: 'GUESS' },
      { text: 'NIOLU', kind: 'ANSWER' }, { text: 'NIOLU', kind: 'GUESS' },
      { text: 'NIVURA', kind: 'ANSWER' }, { text: 'NIVURA', kind: 'GUESS' },
      { text: 'NUVEMBRE', kind: 'ANSWER' }, { text: 'NUVEMBRE', kind: 'GUESS' },
      { text: 'PAESANNU', kind: 'ANSWER' }, { text: 'PAESANNU', kind: 'GUESS' },
      { text: 'PAESELLU', kind: 'ANSWER' }, { text: 'PAESELLU', kind: 'GUESS' },
      { text: 'PARLATA', kind: 'ANSWER' }, { text: 'PARLATA', kind: 'GUESS' },
      { text: 'PASTUREL', kind: 'ANSWER' }, { text: 'PASTUREL', kind: 'GUESS' },
      { text: 'PIANA', kind: 'ANSWER' }, { text: 'PIANA', kind: 'GUESS' },
      { text: 'PINETA', kind: 'ANSWER' }, { text: 'PINETA', kind: 'GUESS' },
      { text: 'PORTELLI', kind: 'ANSWER' }, { text: 'PORTELLI', kind: 'GUESS' },
      { text: 'PORTU', kind: 'ANSWER' }, { text: 'PORTU', kind: 'GUESS' },
      { text: 'PRATU', kind: 'ANSWER' }, { text: 'PRATU', kind: 'GUESS' },
      { text: 'ROSSU', kind: 'ANSWER' }, { text: 'ROSSU', kind: 'GUESS' },
      { text: 'SABATU', kind: 'ANSWER' }, { text: 'SABATU', kind: 'GUESS' },
      { text: 'SANGUINE', kind: 'ANSWER' }, { text: 'SANGUINE', kind: 'GUESS' },
      { text: 'SCARPU', kind: 'ANSWER' }, { text: 'SCARPU', kind: 'GUESS' },
      { text: 'SCOLA', kind: 'ANSWER' }, { text: 'SCOLA', kind: 'GUESS' },
      { text: 'SCRIVE', kind: 'ANSWER' }, { text: 'SCRIVE', kind: 'GUESS' },
      { text: 'SPARTURA', kind: 'ANSWER' }, { text: 'SPARTURA', kind: 'GUESS' },
      { text: 'SPASSU', kind: 'ANSWER' }, { text: 'SPASSU', kind: 'GUESS' },
      { text: 'STRADA', kind: 'ANSWER' }, { text: 'STRADA', kind: 'GUESS' },
      { text: 'STUDIENTE', kind: 'ANSWER' }, { text: 'STUDIENTE', kind: 'GUESS' },
      { text: 'TEMPU', kind: 'ANSWER' }, { text: 'TEMPU', kind: 'GUESS' },
      { text: 'TERRANOVA', kind: 'ANSWER' }, { text: 'TERRANOVA', kind: 'GUESS' },
      { text: 'TORRA', kind: 'ANSWER' }, { text: 'TORRA', kind: 'GUESS' },
      { text: 'TRADIZIO', kind: 'ANSWER' }, { text: 'TRADIZIO', kind: 'GUESS' },
      { text: 'TRENU', kind: 'ANSWER' }, { text: 'TRENU', kind: 'GUESS' },
      { text: 'UTTOBRE', kind: 'ANSWER' }, { text: 'UTTOBRE', kind: 'GUESS' },
      { text: 'VENACO', kind: 'ANSWER' }, { text: 'VENACO', kind: 'GUESS' },
      { text: 'VENTAGLI', kind: 'ANSWER' }, { text: 'VENTAGLI', kind: 'GUESS' },
      { text: 'VENTU', kind: 'ANSWER' }, { text: 'VENTU', kind: 'GUESS' },
      { text: 'VERDE', kind: 'ANSWER' }, { text: 'VERDE', kind: 'GUESS' },
      { text: 'VILLAGGI', kind: 'ANSWER' }, { text: 'VILLAGGI', kind: 'GUESS' },
      { text: 'ZITELLA', kind: 'ANSWER' }, { text: 'ZITELLA', kind: 'GUESS' },
      { text: 'ZITELLU', kind: 'ANSWER' }, { text: 'ZITELLU', kind: 'GUESS' },
      { text: 'ZUCCARU', kind: 'ANSWER' }, { text: 'ZUCCARU', kind: 'GUESS' },
    ];

  const allWords: SeedWord[] = externalWords ? [...builtInWords, ...externalWords] : builtInWords

  for (const w of allWords) {
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

  // --------------------------------
  // 3) Faits historiques (par date)
  // --------------------------------
  const builtInFacts: SeedFact[] = [
    {
      date: '1736-03-12',
      fr: '12 mars 1736 : Théodore de Neuhoff débarque en Corse et sera proclamé roi Théodore Ier.',
      en: 'March 12, 1736: Theodor von Neuhoff lands in Corsica and is proclaimed King Theodore I.',
      co: '12 di marzu 1736: Teodoru di Neuhoff sbarca in Corsica è hè proclamatu rè Teodoru I.'
    },
    {
      date: '1769-05-08',
      fr: "8 mai 1769 : bataille de Ponte Novu, tournant majeur de l'histoire corse.",
      en: 'May 8, 1769: Battle of Ponte Novu, a major turning point in Corsican history.',
      co: '8 di maghju 1769: a battaglia di Ponte Novu, un scontru decisivu per a storia corsa.'
    },
    {
      date: '1755-01-21',
      fr: '21 janvier 1755 : Pasquale Paoli proclame la Constitution corse.',
      en: 'January 21, 1755: Pasquale Paoli proclaims the Corsican Constitution.',
      co: '21 di ghjennaghju 1755: Pasquale Paoli pruclama a Custituzione corsa.'
    }
  ]

  const facts: SeedFact[] = externalFacts ? [...builtInFacts, ...externalFacts] : builtInFacts

  for (const f of facts) {
    try {
      const dateObj = dateAtUtcMidnight(f.date)
      await prisma.historicalFact.upsert({
        where: { date: dateObj },
        update: {
          fact_fr: f.fr ?? null,
          fact_en: f.en ?? null,
          fact_co: f.co ?? null,
        },
        create: {
          date: dateObj,
          fact_fr: f.fr ?? null,
          fact_en: f.en ?? null,
          fact_co: f.co ?? null,
        }
      })
    } catch (err) {
      console.warn('Fact ignoré (date invalide):', f, err)
    }
  }

  // -------------------------------------------------
  // 4) DailyAnswer pour aujourd’hui (premier ANSWER)
  // -------------------------------------------------
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
    // Si ton runtime crie sur process.exit, commente la ligne suivante :
    // process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
