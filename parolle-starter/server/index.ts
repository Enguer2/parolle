import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

// ---------- CONFIG ----------
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 5 minutes pour tests ; 24h en prod
const BUCKET_MS = 5 * 60 * 1000

// ---------- UTILS ----------
const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

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

type JWTPayload = { uid: number }

function signToken(uid: number) {
  return jwt.sign({ uid } as JWTPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    ;(req as any).uid = payload.uid
    return next()
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

// ---------- MIDDLEWARES ----------
app.use(cors())
app.use(express.json())

// ---------- GAME HELPERS ----------
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

// ---------- AUTH ----------
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password } = req.body as { email?: string; username?: string; password?: string }
    if (!email || !username || !password) return res.status(400).json({ error: 'bad_input' })

    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] }, select: { id: true } })
    if (exists) return res.status(400).json({ error: 'already_exists' })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, username, password: hash } })

    const token = signToken(user.id)
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, score: user.score } })
  } catch (e) {
    console.error('POST /api/register error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) return res.status(400).json({ error: 'bad_input' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'invalid_credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })

    const token = signToken(user.id)
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, score: user.score } })
  } catch (e) {
    console.error('POST /api/login error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/me', auth, async (req, res) => {
  const uid = (req as any).uid as number
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true, email: true, username: true, score: true } })
  if (!user) return res.status(404).json({ error: 'not_found' })
  res.json({ user })
})

// Score + Leaderboard
app.post('/api/score', auth, async (req, res) => {
  try {
    const uid = (req as any).uid as number
    const { delta, set } = req.body as { delta?: number; set?: number }

    let data: { score?: number } = {}
    if (typeof set === 'number') {
      data.score = Math.max(0, Math.floor(set))
    } else if (typeof delta === 'number') {
      const u = await prisma.user.findUnique({ where: { id: uid }, select: { score: true } })
      const next = Math.max(0, (u?.score ?? 0) + Math.floor(delta))
      data.score = next
    } else {
      return res.status(400).json({ error: 'bad_input' })
    }

    const updated = await prisma.user.update({ where: { id: uid }, data, select: { score: true } })
    res.json({ score: updated.score })
  } catch (e) {
    console.error('POST /api/score error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/leaderboard', async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
  const rows = await prisma.user.findMany({
    orderBy: [{ score: 'desc' }, { id: 'asc' }],
    take: limit,
    select: { id: true, username: true, score: true }
  })
  res.json({ top: rows })
})

// ---------- GAME ROUTES ----------
app.get('/api/solution', async (req, res) => {
  try {
    const q = req.query.bucket
    const bucket = Number.isFinite(Number(q)) ? Number(q) : Math.floor(Date.now() / BUCKET_MS)

    const word = await getAnswerForBucket(bucket)
    console.log('[API /solution]', { bucket, text: word?.text })

    if (!word?.text) return res.status(404).json({ error: 'no_answer' })
    res.json({ text: String(word.text) })
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

// ---------- HISTORICAL FACTS ----------
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

type GreetingsMap = Record<string, Record<string, string>>

let GREETINGS: GreetingsMap = {
  fr: { default: 'Bonjour, nous sommes le {DATE}' },
  co: { default: 'Bonghjornu, oghje hè u {DATE}' },
  en: { default: 'Hello, today is {DATE}' },
}

try {
  const p = path.join(process.cwd(), 'prisma', 'data', 'greetings.json')
  if (fs.existsSync(p)) {
    const loaded = JSON.parse(fs.readFileSync(p, 'utf8')) as GreetingsMap
    GREETINGS = { ...GREETINGS, ...loaded }
  }
} catch { /* ignore */ }

// Pâques (Meeus/Jones/Butcher)
function easterDate(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

function greetingTemplateFor(lang: 'fr'|'co'|'en', y: number, m: number, d: number) {
  const map = GREETINGS[lang] ?? GREETINGS.fr
  const key = String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0')

  const e = easterDate(y)
  const easterKey = String(e.month).padStart(2,'0') + '-' + String(e.day).padStart(2,'0')
  const isEaster = key === easterKey

  if (isEaster && map['easter']) return map['easter']
  if (map[key]) return map[key]
  return map['default'] ?? GREETINGS.fr.default
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
      : `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`

    const tpl = greetingTemplateFor(lang as 'fr'|'co'|'en', y, m, d)
    const headerText = tpl.replace('{DATE}', dateText)

    const factText =
      (lang === 'co' && fact?.fact_co) ||
      (lang === 'en' && fact?.fact_en) ||
      fact?.fact_fr || null

    res.json({ date: iso, dateText, headerText, fact: factText })
  } catch (e) {
    console.error('GET /api/fact error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// ---------- BOOT ----------
const PORT = 8787
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
