import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const toBase = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()

async function main() {
  const words = [
    { text: 'CORSU', kind: 'ANSWER' },
    { text: 'MUNTAGNA', kind: 'ANSWER' },
    { text: 'BALANCA', kind: 'ANSWER' },
    { text: 'ACQUA', kind: 'GUESS' },
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
