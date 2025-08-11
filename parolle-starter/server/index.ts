import express from 'express'
import cors from 'cors'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

app.use(cors())
app.use(express.json())

// 5 minutes pour tests ; 24h en prod
const BUCKET_MS = 5 * 60 * 1000
const normalize = (s: string) => s.normalize('NFC').toUpperCase()

function scoreGuess(guess: string, target: string) {
  const res: Array<'correct'|'present'|'absent'> = Array(guess.length).fill('absent')
  const counts: Record<string, number> = {}
  const g = normalize(guess)
  const t = normalize(target)
  for (const ch of t) counts[ch] = (counts[ch] || 0) + 1
  for (let i = 0; i < g.length; i++) {
    if (g[i] === t[i]) { res[i] = 'correct'; counts[g[i]]!-- }
  }
  for (let i = 0; i < g.length; i++) {
    if (res[i] === 'correct') continue
    const ch = g[i]
    if (counts[ch] > 0) { res[i] = 'present'; counts[ch]!-- }
  }
  return res
}

async function getAnswerForNow() {
  const total = await prisma.word.count({ where: { kind: WordKind.ANSWER, is_active: true } })
  if (total === 0) return null
  const bucket = Math.floor(Date.now() / BUCKET_MS)
  const index = bucket % total
  return prisma.word.findFirst({
    where: { kind: WordKind.ANSWER, is_active: true },
    orderBy: { id: 'asc' },
    skip: index,
    take: 1,
  })
}

async function getAnswerForBucket(bucket: number) {
  const total = await prisma.word.count({ where: { kind: WordKind.ANSWER, is_active: true } })
  if (total === 0) return null
  const index = bucket % total
  return prisma.word.findFirst({
    where: { kind: WordKind.ANSWER, is_active: true },
    orderBy: { id: 'asc' },
    skip: index,
    take: 1,
  })
}

app.get('/api/solution', async (req, res) => {
  try {
    const bucket = Number(req.query.bucket)
    if (!Number.isFinite(bucket)) return res.status(400).json({ error: 'bad_request' })
    const word = await getAnswerForBucket(bucket)
    if (!word) return res.status(404).json({ error: 'no_answer' })
    res.json({ text: word.text })
  } catch (e) {
    console.error('GET /api/solution error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/daily', async (_req, res) => {
  try {
    const word = await getAnswerForNow()
    if (!word) return res.status(404).json({ error: 'no_answer' })
    const bucket = Math.floor(Date.now() / BUCKET_MS)
    res.json({
      length: word.length,
      attemptLimit: Math.max(6, Math.min(10, word.length)),
      bucket,
      bucketMs: BUCKET_MS
    })
  } catch (e) {
    console.error('GET /api/daily error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/guess', async (req, res) => {
  try {
    const { guess, bucket } = req.body as { guess: string; bucket?: number }
    if (!guess || typeof guess !== 'string') return res.status(400).json({ error: 'invalid_guess' })
    if (typeof bucket !== 'number') return res.status(400).json({ error: 'server_error' })

    const word = await getAnswerForBucket(bucket)
    if (!word) return res.status(404).json({ error: 'no_answer' })

    const norm = normalize(guess)
    if (norm.length !== word.length) {
      return res.status(400).json({ error: 'length_mismatch', expected: word.length })
    }

    const exists = await prisma.word.findFirst({
      where: {
        is_active: true,
        length: word.length,
        kind: { in: [WordKind.ANSWER, WordKind.GUESS] },
        OR: [{ text: norm }, { text_base: toBase(norm) }],
      },
      select: { id: true },
    })
    if (!exists) return res.status(400).json({ error: 'invalid_word' })

    const states = scoreGuess(norm, word.text)
    const result = states.map(s => (s === 'correct' ? 'G' : s === 'present' ? 'Y' : 'B')).join('')
    res.json({ result })
  } catch (e) {
    console.error('POST /api/guess error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ------- Faits historiques -------

const pickLang = (v?: string | string[]) => {
  const raw = Array.isArray(v) ? v[0] : (v || '')
  const x = raw.toLowerCase()
  if (x.startsWith('co')) return 'co'
  if (x.startsWith('en')) return 'en'
  return 'fr'
}

function parisISODate(base?: Date) {
  const d = base ?? new Date()
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(d)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  const dd = get('day')
  const mm = get('month')
  const yyyy = get('year')
  return { iso: `${yyyy}-${mm}-${dd}`, y: Number(yyyy), m: Number(mm), d: Number(dd) }
}

app.get('/api/fact', async (req, res) => {
  try {
    const lang = pickLang((req.query.lang as string) || req.headers['accept-language'])
    const qDate = (req.query.date as string) || ''
    let iso: string, y: number, m: number, d: number

    if (/^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      const [yyStr, mmStr, ddStr] = qDate.split('-')
      const yy = Number(yyStr), mm = Number(mmStr), dd = Number(ddStr)
      if (!Number.isInteger(yy) || !Number.isInteger(mm) || !Number.isInteger(dd)) {
        return res.status(400).json({ error: 'bad_date' })
      }
      iso = qDate; y = yy; m = mm; d = dd
    } else {
      const parts = parisISODate(new Date())
      iso = parts.iso; y = parts.y; m = parts.m; d = parts.d
    }

    const [fact] = await prisma.$queryRaw<
    Array<{ fact_fr: string|null; fact_en: string|null; fact_co: string|null }>
  >`
    SELECT "fact_fr","fact_en","fact_co"
    FROM public."HistoricalFact"
    WHERE EXTRACT(MONTH FROM "date") = ${m}
      AND EXTRACT(DAY   FROM "date") = ${d}
    ORDER BY "date" ASC
    LIMIT 1
  `

  const [month] = await prisma.$queryRaw<Array<{ afterDay: string }>>`
  SELECT "afterDay"
  FROM public."MonthName"
  WHERE "locale" = ${lang} AND "month" = ${m}
  LIMIT 1
`


const dateText = month
  ? `${d} ${month.afterDay} ${y}`
  : `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;

const factText =
  (lang === 'co' && fact?.fact_co) ||
  (lang === 'en' && fact?.fact_en) ||
  fact?.fact_fr || null

    res.json({ date: iso, dateText, fact: factText })
  } catch (e) {
    console.error('GET /api/fact error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

const PORT = 8787
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
