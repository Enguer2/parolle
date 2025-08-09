import express from 'express'
import cors from 'cors'
import { PrismaClient, WordKind } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
app.use(cors())
app.use(express.json())

// 1 minute pour les tests ; passe à 24h en prod
const BUCKET_MS = 60 * 1000
// const BUCKET_MS = 24 * 60 * 60 * 1000

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
  const word = await prisma.word.findFirst({
    where: { kind: WordKind.ANSWER, is_active: true },
    orderBy: { id: 'asc' },
    skip: index,
    take: 1,
  })
  return word
}

app.get('/api/daily', async (_req, res) => {
  try {
    const word = await getAnswerForNow()
    if (!word) return res.status(404).json({ error: 'no_answer' })
    res.json({
      length: word.length,
      attemptLimit: Math.max(6, Math.min(10, word.length)),
      bucketMs: BUCKET_MS,
    })
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/guess', async (req, res) => {
  try {
    const { guess } = req.body as { guess: string }
    if (!guess || typeof guess !== 'string') {
      return res.status(400).json({ error: 'invalid_guess' })
    }
    const word = await getAnswerForNow()
    if (!word) return res.status(404).json({ error: 'no_answer' })

    // longueur
    const norm = normalize(guess)
    if (norm.length !== word.length) {
      return res.status(400).json({ error: 'length_mismatch', expected: word.length })
    }

    // ✅ validation dictionnaire (ANSWER ou GUESS, actif, même longueur)
    const exists = await prisma.word.findFirst({
      where: {
        is_active: true,
        length: word.length,
        kind: { in: [WordKind.ANSWER, WordKind.GUESS] },
        OR: [
          { text: norm },              // exact (accentué)
          { text_base: toBase(norm) }, // sans accents
        ],
      },
      select: { id: true },
    })
    if (!exists) {
      return res.status(400).json({ error: 'invalid_word' }) // 👈 mot inconnu
    }

    // scoring
    const states = scoreGuess(norm, word.text)
    const result = states.map(s => (s === 'correct' ? 'G' : s === 'present' ? 'Y' : 'B')).join('')
    return res.json({ result })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'server_error' })
  }
})

const PORT = 8787
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
