import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const toBase = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()

async function main() {
  const words = [
    // Mots mystères (ANSWER)
    { text: 'MONTE', kind: 'ANSWER' },      // monte / montagne
    { text: 'CAMPAGNA', kind: 'ANSWER' },   // campagne
    { text: 'VENTU', kind: 'ANSWER' },      // vent
    { text: 'ISULA', kind: 'ANSWER' },      // île
    { text: 'PIANA', kind: 'ANSWER' },      // Piana (village corse)
    { text: 'FURESTA', kind: 'ANSWER' },    // forêt
    { text: 'TORRA', kind: 'ANSWER' },      // tour
    { text: 'PORTU', kind: 'ANSWER' },      // port
    { text: 'LUMERA', kind: 'ANSWER' },     // lumière
    { text: 'FURESTER', kind: 'ANSWER' }, // étranger
    { text: 'PAESELLU', kind: 'ANSWER' }, // petit village
    { text: 'PAESANNU', kind: 'ANSWER' }, // paysan
    { text: 'ISULETTI', kind: 'ANSWER' }, // petites îles
    { text: 'SANGUINE', kind: 'ANSWER' }, // sanguine
    { text: 'VENTAGLI', kind: 'ANSWER' }, // éventail
    { text: 'MACCHJIA', kind: 'ANSWER' }, // maquis
    { text: 'TERRANOVA', kind: 'ANSWER' }, // nouvelle terre (si accepté 9 lettres, on peut enlever une)
  

    // Mots utilisables pour deviner (GUESS)
    { text: 'CAMPAGNA', kind: 'GUESS' },   // campagne
    { text: 'MUNTI', kind: 'GUESS' },       // monts
    { text: 'PRATU', kind: 'GUESS' },       // pré
    { text: 'GHJATTU', kind: 'GUESS' },     // chat
    { text: 'CAVALLU', kind: 'GUESS' },     // cheval
    { text: 'ISULETTI', kind: 'GUESS' }, // petites îles
    { text: 'STRADA', kind: 'GUESS' },      // route
    { text: 'FIURE', kind: 'GUESS' },       // fleur
    { text: 'CIPOLLA', kind: 'GUESS' },     // oignon
    { text: 'FIERU', kind: 'GUESS' },       // fier
    { text: 'ACQUA', kind: 'GUESS' },       // eau
    { text: 'PANE', kind: 'GUESS' },        // pain
    { text: 'VINU', kind: 'GUESS' },        // vin
    { text: 'CANTA', kind: 'GUESS' },       // chante
    { text: 'AMICU', kind: 'GUESS' },       // ami
    { text: 'CASE', kind: 'GUESS' },        // maison
    { text: 'FRATE', kind: 'GUESS' },       // frère
    { text: 'MACCHJIA', kind: 'GUESS' }, // maquis
    { text: 'DOLCE', kind: 'GUESS' },       // doux / dessert
    { text: 'ROSSU', kind: 'GUESS' },       // rouge
    { text: 'NIVURA', kind: 'GUESS' },      // noire
    { text: 'VERDE', kind: 'GUESS' },       // vert
    { text: 'BELLU', kind: 'GUESS' },        // beau
    { text: 'BANDERIA', kind: 'GUESS' }, // bannière
    { text: 'PORTELLI', kind: 'GUESS' }, // petites portes
    { text: 'FESTIGHJ', kind: 'GUESS' }, // fête (festin)
    { text: 'TRADIZIO', kind: 'GUESS' }, // tradition
    { text: 'VILLAGGI', kind: 'GUESS' }, // villages
    { text: 'CANTADOR', kind: 'GUESS' }, // chanteur
    { text: 'PASTUREL', kind: 'GUESS' }, // berger
    { text: 'CASTAGNE', kind: 'GUESS' }, // châtaignes
    { text: 'SPARTURA', kind: 'GUESS' }, // séparation
    { text: 'FRATELLI', kind: 'GUESS' }, // frères
  ]

  for (const w of words) {
    await prisma.word.upsert({
      where: { text_kind: { text: w.text, kind: w.kind as any } },
      update: {},
      create: {
        text: w.text,
        text_base: toBase(w.text),
        length: w.text.length,
        kind: w.kind as any,
      }
    })
  }

  // exemple de DailyAnswer pour aujourd’hui (UTC 00:00)
  const today = new Date()
  today.setUTCHours(0,0,0,0)
  const corsu = await prisma.word.findFirst({ where: { text: 'CORSU', kind: 'ANSWER' } })
  if (corsu) {
    await prisma.dailyAnswer.upsert({
      where: { date: today },
      update: { wordId: corsu.id },
      create: { date: today, wordId: corsu.id }
    })
  }

  console.log('Seed OK')
}

main().finally(() => prisma.$disconnect())
